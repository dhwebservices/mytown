"""Reviews — only allowed on completed bookings (enforced here)."""
from fastapi import APIRouter, Depends, HTTPException
from db import db
from models import Review, ReviewCreate, now_iso, new_id
from security import get_current_user, require_role

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


async def _recalc_business_rating(business_id: str):
    cursor = db.reviews.find({"business_id": business_id, "hidden": False}, {"rating": 1, "_id": 0})
    ratings = [r["rating"] async for r in cursor]
    count = len(ratings)
    avg = round(sum(ratings) / count, 2) if count else 0
    await db.businesses.update_one(
        {"id": business_id}, {"$set": {"rating_avg": avg, "rating_count": count}}
    )


@router.post("", response_model=Review)
async def create_review(data: ReviewCreate, user: dict = Depends(require_role("customer"))):
    booking = await db.bookings.find_one({"id": data.booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(404, "Booking not found")
    if booking["customer_id"] != user["id"]:
        raise HTTPException(403, "Not your booking")
    if booking["status"] != "completed":
        raise HTTPException(400, "Can only review completed bookings")
    if await db.reviews.find_one({"booking_id": data.booking_id}):
        raise HTTPException(400, "Review already submitted for this booking")

    doc = {
        "id": new_id(),
        "booking_id": data.booking_id,
        "customer_id": user["id"],
        "business_id": booking["business_id"],
        "rating": data.rating,
        "comment": data.comment,
        "hidden": False,
        "created_at": now_iso(),
    }
    await db.reviews.insert_one(doc)
    await _recalc_business_rating(booking["business_id"])
    doc.pop("_id", None)
    return doc


@router.get("/mine", response_model=list[Review])
async def my_reviews(user: dict = Depends(require_role("customer"))):
    return await db.reviews.find({"customer_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
