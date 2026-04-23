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

    user = {
        "id": new_id(),
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
    user = await db.users.find_one({
        "$or": [{"email": identifier}, {"username": identifier}]
    })
    if not user or not verify_password(data.password, user["password_hash"]):
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
