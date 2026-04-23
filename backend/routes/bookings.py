"""Bookings: customer creates, business manages status, admin full access."""
from fastapi import APIRouter, Depends, HTTPException
from db import db
from models import Booking, BookingCreate, BookingStatusUpdate, now_iso, new_id
from security import get_current_user, require_role

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


ALLOWED_TRANSITIONS = {
    "pending": {"confirmed", "rejected", "reschedule_requested", "cancelled"},
    "confirmed": {"completed", "cancelled", "no_show", "reschedule_requested"},
    "reschedule_requested": {"confirmed", "cancelled", "rejected"},
    "rejected": set(),
    "cancelled": set(),
    "completed": set(),
    "no_show": set(),
}


async def _log_status(booking_id: str, from_s: str, to_s: str, actor: str, note: str | None):
    await db.booking_status_history.insert_one({
        "id": new_id(),
        "booking_id": booking_id,
        "from_status": from_s,
        "to_status": to_s,
        "changed_by": actor,
        "note": note,
        "at": now_iso(),
    })


@router.post("", response_model=Booking)
async def create_booking(data: BookingCreate, user: dict = Depends(require_role("customer"))):
    biz = await db.businesses.find_one({"id": data.business_id}, {"_id": 0})
    if not biz or biz["status"] != "published":
        raise HTTPException(404, "Business not available")
    service_name = None
    duration = data.duration_minutes
    if data.service_id:
        svc = await db.services.find_one(
            {"id": data.service_id, "business_id": data.business_id}, {"_id": 0}
        )
        if not svc:
            raise HTTPException(404, "Service not found")
        service_name = svc["name"]
        duration = svc.get("duration_minutes", duration)

    ts = now_iso()
    doc = {
        "id": new_id(),
        "customer_id": user["id"],
        "business_id": data.business_id,
        "service_id": data.service_id,
        "service_name": service_name,
        "start_at": data.start_at,
        "duration_minutes": duration,
        "status": "pending",
        "notes": data.notes,
        "created_at": ts,
        "updated_at": ts,
    }
    await db.bookings.insert_one(doc)
    await _log_status(doc["id"], "", "pending", user["id"], None)
    doc.pop("_id", None)
    return doc


@router.get("/mine", response_model=list[Booking])
async def my_bookings(user: dict = Depends(get_current_user)):
    if user["role"] == "customer":
        q = {"customer_id": user["id"]}
    elif user["role"] == "business":
        biz_ids = [b["id"] async for b in db.businesses.find(
            {"owner_user_id": user["id"]}, {"id": 1, "_id": 0})]
        q = {"business_id": {"$in": biz_ids}}
    else:
        q = {}
    cursor = db.bookings.find(q, {"_id": 0}).sort("start_at", -1).limit(200)
    return await cursor.to_list(200)


@router.get("/{booking_id}", response_model=Booking)
async def get_booking(booking_id: str, user: dict = Depends(get_current_user)):
    b = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not b:
        raise HTTPException(404, "Not found")
    if user["role"] == "customer" and b["customer_id"] != user["id"]:
        raise HTTPException(403, "Forbidden")
    if user["role"] == "business":
        biz = await db.businesses.find_one({"id": b["business_id"]}, {"_id": 0})
        if not biz or biz["owner_user_id"] != user["id"]:
            raise HTTPException(403, "Forbidden")
    return b


@router.patch("/{booking_id}/status", response_model=Booking)
async def update_status(
    booking_id: str, data: BookingStatusUpdate, user: dict = Depends(get_current_user)
):
    b = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not b:
        raise HTTPException(404, "Not found")

    # Permission
    if user["role"] == "customer":
        if b["customer_id"] != user["id"]:
            raise HTTPException(403, "Forbidden")
        if data.status != "cancelled":
            raise HTTPException(403, "Customers can only cancel")
    elif user["role"] == "business":
        biz = await db.businesses.find_one({"id": b["business_id"]}, {"_id": 0})
        if not biz or biz["owner_user_id"] != user["id"]:
            raise HTTPException(403, "Forbidden")

    # Transitions
    if user["role"] != "manager":
        allowed = ALLOWED_TRANSITIONS.get(b["status"], set())
        if data.status not in allowed:
            raise HTTPException(400, f"Cannot transition from {b['status']} to {data.status}")

    await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": data.status, "updated_at": now_iso()}},
    )
    await _log_status(booking_id, b["status"], data.status, user["id"], data.note)
    b2 = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    return b2
