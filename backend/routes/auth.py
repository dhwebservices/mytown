"""Shared auth: register / login / forgot / reset / me.
Single portal for customers, businesses, managers (role-aware redirect on the client)."""
import os
import secrets
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Depends

from db import db
from models import (
    RegisterRequest, LoginRequest, AuthResponse, UserPublic,
    ForgotPasswordRequest, ResetPasswordRequest, now_iso, new_id,
)
from security import (
    hash_password, verify_password, create_access_token, get_current_user,
)
from emailer import send_password_reset
from supabase_auth import sign_in_user, sign_up_user, admin_update_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

RESET_TOKEN_HOURS = 2


async def _audit(actor_id: str, action: str, target: str, details: dict | None = None):
    await db.audit_logs.insert_one({
        "id": new_id(),
        "actor_id": actor_id,
        "action": action,
        "target": target,
        "details": details or {},
        "at": now_iso(),
    })


@router.post("/register", response_model=AuthResponse)
async def register(data: RegisterRequest):
    email = data.email.lower().strip()
    username = data.username.lower().strip()

    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email already registered")
    if await db.users.find_one({"username": username}):
        raise HTTPException(400, "Username already taken")

    try:
        auth_response = sign_up_user(
            email,
            data.password,
            user_metadata={
                "role": data.role,
                "username": username,
                "full_name": data.full_name,
                "phone": data.phone,
            },
        )
    except RuntimeError as error:
        raise HTTPException(400, str(error))

    auth_user = auth_response.get("user") or {}
    auth_user_id = auth_user.get("id")
    if not auth_user_id:
        raise HTTPException(500, "Could not create auth user")

    user = {
        "id": auth_user_id,
        "email": email,
        "username": username,
        "password_hash": hash_password(data.password),
        "role": data.role,
        "full_name": data.full_name,
        "phone": data.phone,
        "status": "active",
        "email_verified": False,
        "created_at": now_iso(),
    }
    await db.users.insert_one(user)
    await _audit(user["id"], "user.register", f"user:{user['id']}", {"role": data.role})

    token = create_access_token(user["id"], user["role"])
    public = {k: v for k, v in user.items() if k != "password_hash"}
    public.pop("_id", None)
    return {"token": token, "user": UserPublic(**public)}


@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest):
    identifier = data.identifier.lower().strip()
    local_user = await db.users.find_one({
        "$or": [{"email": identifier}, {"username": identifier}]
    })
    login_email = local_user["email"] if local_user else identifier

    try:
        auth_response = sign_in_user(login_email, data.password)
    except RuntimeError:
        raise HTTPException(401, "Invalid credentials")

    auth_user = auth_response.get("user") or {}
    user = await db.users.find_one({"id": auth_user.get("id")}) or local_user
    if not user and auth_user.get("email"):
        user = {
            "id": auth_user["id"],
            "email": auth_user["email"].lower().strip(),
            "username": auth_user.get("user_metadata", {}).get("username") or auth_user["email"].split("@")[0],
            "password_hash": hash_password(data.password),
            "role": auth_user.get("user_metadata", {}).get("role") or "customer",
            "full_name": auth_user.get("user_metadata", {}).get("full_name"),
            "phone": auth_user.get("user_metadata", {}).get("phone"),
            "status": "active",
            "email_verified": bool(auth_user.get("email_confirmed_at")),
            "created_at": now_iso(),
        }
        await db.users.insert_one(user)
    elif user and not verify_password(data.password, user.get("password_hash", "")):
        await db.users.update_one(
            {"id": user["id"]},
            {"$set": {"password_hash": hash_password(data.password), "email_verified": bool(auth_user.get("email_confirmed_at"))}},
        )
        user["password_hash"] = hash_password(data.password)
        user["email_verified"] = bool(auth_user.get("email_confirmed_at"))

    if not user:
        raise HTTPException(401, "Invalid credentials")
    if user.get("status") == "suspended":
        raise HTTPException(403, "Account suspended")

    token = create_access_token(user["id"], user["role"])
    public = {k: v for k, v in user.items() if k not in ("password_hash", "_id")}
    await _audit(user["id"], "user.login", f"user:{user['id']}")
    return {"token": token, "user": UserPublic(**public)}


@router.get("/me", response_model=UserPublic)
async def me(user: dict = Depends(get_current_user)):
    return UserPublic(**user)


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    email = data.email.lower().strip()
    user = await db.users.find_one({"email": email})
    # Always return ok to avoid user enumeration
    if user:
        token = secrets.token_urlsafe(32)
        expires = (datetime.now(timezone.utc) + timedelta(hours=RESET_TOKEN_HOURS)).isoformat()
        await db.password_resets.insert_one({
            "id": new_id(),
            "user_id": user["id"],
            "token": token,
            "expires_at": expires,
            "used": False,
            "created_at": now_iso(),
        })
        frontend_url = os.environ.get("FRONTEND_URL", "").rstrip("/")
        reset_url = f"{frontend_url}/reset-password?token={token}" if frontend_url else f"/reset-password?token={token}"
        await send_password_reset(email, reset_url)
    return {"ok": True, "message": "If the email exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest):
    record = await db.password_resets.find_one({"token": data.token, "used": False})
    if not record:
        raise HTTPException(400, "Invalid or expired token")
    expires = datetime.fromisoformat(record["expires_at"])
    if expires < datetime.now(timezone.utc):
        raise HTTPException(400, "Token expired")

    user = await db.users.find_one({"id": record["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(404, "User not found")

    try:
        admin_update_user(user["id"], {"password": data.password})
    except RuntimeError as error:
        raise HTTPException(400, str(error))

    await db.users.update_one(
        {"id": record["user_id"]},
        {"$set": {"password_hash": hash_password(data.password)}},
    )
    await db.password_resets.update_one(
        {"id": record["id"]},
        {"$set": {"used": True, "used_at": now_iso()}},
    )
    await _audit(record["user_id"], "user.password_reset", f"user:{record['user_id']}")
    return {"ok": True}
