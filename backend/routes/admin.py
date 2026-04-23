"""Manager/admin endpoints: full control over the platform."""
import secrets
import os
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from db import db
from models import (
    UserPublic, AdminCreateUserRequest, UpdateUserRequest,
    Invoice, InvoiceInput, InvoiceStatusUpdate,
    Business, BusinessAdminInput,
    now_iso, new_id,
)
from security import require_role, hash_password
from supabase_auth import admin_create_user, admin_update_user
from profile_sync import try_sync_profile_row

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_role("manager"))])


# -------- Stats --------
@router.get("/stats")
async def stats():
    total_users = await db.users.count_documents({})
    total_customers = await db.users.count_documents({"role": "customer"})
    total_businesses_users = await db.users.count_documents({"role": "business"})
    total_businesses = await db.businesses.count_documents({})
    published = await db.businesses.count_documents({"status": "published"})
    pending_review = await db.businesses.count_documents({"status": "pending"})
    total_bookings = await db.bookings.count_documents({})
    pending_bookings = await db.bookings.count_documents({"status": "pending"})
    completed_bookings = await db.bookings.count_documents({"status": "completed"})
    total_reviews = await db.reviews.count_documents({})
    return {
        "users": {
            "total": total_users,
            "customers": total_customers,
            "businesses": total_businesses_users,
        },
        "businesses": {
            "total": total_businesses,
            "published": published,
            "pending_review": pending_review,
        },
        "bookings": {
            "total": total_bookings,
            "pending": pending_bookings,
            "completed": completed_bookings,
        },
        "reviews": total_reviews,
    }


# -------- Users --------
@router.get("/users", response_model=list[UserPublic])
async def list_users(role: Optional[str] = None, q: Optional[str] = None):
    query: dict = {}
    if role:
        query["role"] = role
    if q:
        query["$or"] = [
            {"email": {"$regex": q, "$options": "i"}},
            {"username": {"$regex": q, "$options": "i"}},
            {"full_name": {"$regex": q, "$options": "i"}},
        ]
    return await db.users.find(query, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)


@router.post("/users", response_model=UserPublic)
async def create_user(data: AdminCreateUserRequest):
    email = data.email.lower().strip()
    username = data.username.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email already in use")
    if await db.users.find_one({"username": username}):
        raise HTTPException(400, "Username already in use")

    try:
        auth_response = admin_create_user(
            email,
            data.password,
            user_metadata={
                "role": data.role,
                "username": username,
                "full_name": data.full_name,
                "phone": data.phone,
            },
            email_confirm=True,
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
    try_sync_profile_row(user)
    user.pop("password_hash", None)
    user.pop("_id", None)
    return user


@router.patch("/users/{user_id}", response_model=UserPublic)
async def update_user(user_id: str, data: UpdateUserRequest):
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(400, "Nothing to update")
    if "email" in update:
        update["email"] = update["email"].lower().strip()
    if "username" in update:
        update["username"] = update["username"].lower().strip()

    supabase_update = {}
    if "email" in update:
        supabase_update["email"] = update["email"]

    current_user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not current_user:
        raise HTTPException(404, "Not found")

    next_user_metadata = {
        "role": update.get("role", current_user.get("role")),
        "username": update.get("username", current_user.get("username")),
        "full_name": update.get("full_name", current_user.get("full_name")),
        "phone": update.get("phone", current_user.get("phone")),
    }
    supabase_update["user_metadata"] = next_user_metadata

    try:
        admin_update_user(user_id, supabase_update)
    except RuntimeError as error:
        raise HTTPException(400, str(error))

    await db.users.update_one({"id": user_id}, {"$set": update})
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(404, "Not found")
    try_sync_profile_row(user)
    return user


@router.post("/users/{user_id}/reset-password")
async def admin_reset_password(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(404, "Not found")
    # Generate a temporary password and a reset token link
    temp = secrets.token_urlsafe(10)
    try:
        admin_update_user(user_id, {"password": temp})
    except RuntimeError as error:
        raise HTTPException(400, str(error))
    await db.users.update_one({"id": user_id}, {"$set": {"password_hash": hash_password(temp)}})
    user["password_hash"] = hash_password(temp)
    try_sync_profile_row(user)
    # Also issue a reset link in case they prefer to set their own
    token = secrets.token_urlsafe(32)
    expires = (datetime.now(timezone.utc) + timedelta(hours=2)).isoformat()
    await db.password_resets.insert_one({
        "id": new_id(),
        "user_id": user_id,
        "token": token,
        "expires_at": expires,
        "used": False,
        "created_at": now_iso(),
    })
    frontend_url = os.environ.get("FRONTEND_URL", "").rstrip("/")
    reset_url = f"{frontend_url}/reset-password?token={token}" if frontend_url else f"/reset-password?token={token}"
    return {"ok": True, "temporary_password": temp, "reset_url": reset_url}


@router.post("/users/{user_id}/suspend")
async def suspend_user(user_id: str):
    await db.users.update_one({"id": user_id}, {"$set": {"status": "suspended"}})
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user:
        try_sync_profile_row(user)
    return {"ok": True}


@router.post("/users/{user_id}/activate")
async def activate_user(user_id: str):
    await db.users.update_one({"id": user_id}, {"$set": {"status": "active"}})
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user:
        try_sync_profile_row(user)
    return {"ok": True}


# -------- Businesses --------
@router.get("/businesses", response_model=list[Business])
async def all_businesses(status: Optional[str] = None):
    q = {"status": status} if status else {}
    return await db.businesses.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)


@router.patch("/businesses/{business_id}", response_model=Business)
async def admin_update_business(business_id: str, data: BusinessAdminInput):
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    update["updated_at"] = now_iso()
    await db.businesses.update_one({"id": business_id}, {"$set": update})
    biz = await db.businesses.find_one({"id": business_id}, {"_id": 0})
    if not biz:
        raise HTTPException(404, "Not found")
    return biz


@router.post("/businesses/{business_id}/approve", response_model=Business)
async def approve_business(business_id: str):
    await db.businesses.update_one(
        {"id": business_id}, {"$set": {"status": "published", "verified": True, "updated_at": now_iso()}}
    )
    return await db.businesses.find_one({"id": business_id}, {"_id": 0})


@router.post("/businesses/{business_id}/reject", response_model=Business)
async def reject_business(business_id: str):
    await db.businesses.update_one(
        {"id": business_id}, {"$set": {"status": "rejected", "updated_at": now_iso()}}
    )
    return await db.businesses.find_one({"id": business_id}, {"_id": 0})


# -------- Bookings --------
@router.get("/bookings")
async def all_bookings():
    return await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


# -------- Reviews --------
@router.get("/reviews")
async def all_reviews():
    return await db.reviews.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@router.post("/reviews/{review_id}/hide")
async def hide_review(review_id: str):
    await db.reviews.update_one({"id": review_id}, {"$set": {"hidden": True}})
    r = await db.reviews.find_one({"id": review_id}, {"_id": 0})
    if r:
        # recalc
        from routes.reviews import _recalc_business_rating
        await _recalc_business_rating(r["business_id"])
    return {"ok": True}


@router.post("/reviews/{review_id}/unhide")
async def unhide_review(review_id: str):
    await db.reviews.update_one({"id": review_id}, {"$set": {"hidden": False}})
    r = await db.reviews.find_one({"id": review_id}, {"_id": 0})
    if r:
        from routes.reviews import _recalc_business_rating
        await _recalc_business_rating(r["business_id"])
    return {"ok": True}


# -------- Invoices --------
@router.get("/invoices", response_model=list[Invoice])
async def list_invoices():
    return await db.invoices.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@router.post("/invoices", response_model=Invoice)
async def create_invoice(data: InvoiceInput, user=Depends(require_role("manager"))):
    items = [i.model_dump() for i in data.items]
    amount = round(sum(i["total"] for i in items), 2)
    count = await db.invoices.count_documents({})
    number = f"MT-{(count + 1):05d}"
    doc = {
        "id": new_id(),
        "business_id": data.business_id,
        "number": number,
        "amount": amount,
        "currency": "GBP",
        "description": data.description,
        "items": items,
        "status": data.status,
        "due_date": data.due_date,
        "created_at": now_iso(),
        "issued_by": user["id"],
    }
    await db.invoices.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.patch("/invoices/{invoice_id}", response_model=Invoice)
async def update_invoice_status(invoice_id: str, data: InvoiceStatusUpdate):
    await db.invoices.update_one({"id": invoice_id}, {"$set": {"status": data.status}})
    inv = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not inv:
        raise HTTPException(404, "Not found")
    return inv


# -------- Audit logs --------
@router.get("/audit-logs")
async def audit_logs(limit: int = 200):
    return await db.audit_logs.find({}, {"_id": 0}).sort("at", -1).limit(limit).to_list(limit)
