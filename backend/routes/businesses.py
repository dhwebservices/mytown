"""Business CRUD + public browse + services + availability."""
import re
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from db import db
from models import (
    Business, BusinessInput, BusinessAdminInput,
    Service, ServiceInput, AvailabilitySlot, AvailabilityInput,
    now_iso, new_id,
)
from security import get_current_user, require_role, get_optional_user

router = APIRouter(prefix="/api/businesses", tags=["businesses"])


def _slugify(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return s or new_id()[:8]


async def _owner_or_manager(business_id: str, user: dict) -> dict:
    biz = await db.businesses.find_one({"id": business_id}, {"_id": 0})
    if not biz:
        raise HTTPException(404, "Business not found")
    if user["role"] != "manager" and biz["owner_user_id"] != user["id"]:
        raise HTTPException(403, "Not your business")
    return biz


# -------- Public browse --------
@router.get("", response_model=list[Business])
async def browse(
    q: Optional[str] = None,
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = 60,
):
    query: dict = {"status": "published"}
    if category:
        query["category_slug"] = category
    if featured is not None:
        query["featured"] = featured
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
        ]
    cursor = db.businesses.find(query, {"_id": 0}).sort(
        [("featured", -1), ("rating_avg", -1), ("created_at", -1)]
    ).limit(limit)
    return await cursor.to_list(limit)


@router.get("/mine", response_model=list[Business])
async def my_businesses(user: dict = Depends(require_role("business", "manager"))):
    cursor = db.businesses.find({"owner_user_id": user["id"]}, {"_id": 0})
    return await cursor.to_list(100)


@router.post("", response_model=Business)
async def create_business(data: BusinessInput, user: dict = Depends(require_role("business", "manager"))):
    ts = now_iso()
    slug_base = _slugify(data.name)
    slug = slug_base
    suffix = 1
    while await db.businesses.find_one({"slug": slug}):
        suffix += 1
        slug = f"{slug_base}-{suffix}"

    doc = {
        "id": new_id(),
        "owner_user_id": user["id"],
        "slug": slug,
        "status": "draft",
        "verified": False,
        "featured": False,
        "rating_avg": 0,
        "rating_count": 0,
        "created_at": ts,
        "updated_at": ts,
        "gallery": [],
        "opening_hours": [],
        "coverage_area": "Pontypridd",
        **{k: v for k, v in data.model_dump().items() if v is not None},
        "name": data.name,
    }
    await db.businesses.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.get("/{business_id}", response_model=Business)
async def get_business(business_id: str, user: Optional[dict] = Depends(get_optional_user)):
    biz = await db.businesses.find_one({"id": business_id}, {"_id": 0})
    if not biz:
        # try slug
        biz = await db.businesses.find_one({"slug": business_id}, {"_id": 0})
    if not biz:
        raise HTTPException(404, "Not found")
    # Non-published businesses only visible to owner/manager
    if biz["status"] != "published":
        if not user or (user["role"] != "manager" and biz["owner_user_id"] != user["id"]):
            raise HTTPException(404, "Not found")
    return biz


@router.put("/{business_id}", response_model=Business)
async def update_business(
    business_id: str, data: BusinessInput, user: dict = Depends(get_current_user)
):
    await _owner_or_manager(business_id, user)
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    update["updated_at"] = now_iso()
    await db.businesses.update_one({"id": business_id}, {"$set": update})
    biz = await db.businesses.find_one({"id": business_id}, {"_id": 0})
    return biz


@router.post("/{business_id}/publish", response_model=Business)
async def publish_business(business_id: str, user: dict = Depends(get_current_user)):
    await _owner_or_manager(business_id, user)
    status = "pending" if user["role"] != "manager" else "published"
    await db.businesses.update_one(
        {"id": business_id},
        {"$set": {"status": status, "updated_at": now_iso()}},
    )
    return await db.businesses.find_one({"id": business_id}, {"_id": 0})


@router.post("/{business_id}/unpublish", response_model=Business)
async def unpublish_business(business_id: str, user: dict = Depends(get_current_user)):
    await _owner_or_manager(business_id, user)
    await db.businesses.update_one(
        {"id": business_id},
        {"$set": {"status": "paused", "updated_at": now_iso()}},
    )
    return await db.businesses.find_one({"id": business_id}, {"_id": 0})


# -------- Services --------
@router.get("/{business_id}/services", response_model=list[Service])
async def list_services(business_id: str):
    return await db.services.find(
        {"business_id": business_id, "active": True}, {"_id": 0}
    ).to_list(200)


@router.post("/{business_id}/services", response_model=Service)
async def add_service(business_id: str, data: ServiceInput, user: dict = Depends(get_current_user)):
    await _owner_or_manager(business_id, user)
    doc = {"id": new_id(), "business_id": business_id, **data.model_dump()}
    await db.services.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.put("/{business_id}/services/{service_id}", response_model=Service)
async def update_service(
    business_id: str, service_id: str, data: ServiceInput,
    user: dict = Depends(get_current_user),
):
    await _owner_or_manager(business_id, user)
    await db.services.update_one(
        {"id": service_id, "business_id": business_id}, {"$set": data.model_dump()}
    )
    svc = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not svc:
        raise HTTPException(404, "Service not found")
    return svc


@router.delete("/{business_id}/services/{service_id}")
async def delete_service(
    business_id: str, service_id: str, user: dict = Depends(get_current_user)
):
    await _owner_or_manager(business_id, user)
    await db.services.update_one(
        {"id": service_id, "business_id": business_id}, {"$set": {"active": False}}
    )
    return {"ok": True}


# -------- Availability --------
@router.get("/{business_id}/availability", response_model=list[AvailabilitySlot])
async def list_availability(business_id: str):
    return await db.availability.find({"business_id": business_id}, {"_id": 0}).to_list(50)


@router.post("/{business_id}/availability", response_model=AvailabilitySlot)
async def add_availability(
    business_id: str, data: AvailabilityInput, user: dict = Depends(get_current_user)
):
    await _owner_or_manager(business_id, user)
    doc = {"id": new_id(), "business_id": business_id, **data.model_dump()}
    await db.availability.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.delete("/{business_id}/availability/{slot_id}")
async def delete_availability(
    business_id: str, slot_id: str, user: dict = Depends(get_current_user)
):
    await _owner_or_manager(business_id, user)
    await db.availability.delete_one({"id": slot_id, "business_id": business_id})
    return {"ok": True}


# -------- Reviews listing --------
@router.get("/{business_id}/reviews")
async def business_reviews(business_id: str):
    return await db.reviews.find(
        {"business_id": business_id, "hidden": False}, {"_id": 0}
    ).sort("created_at", -1).to_list(200)
