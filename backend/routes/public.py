"""Misc public endpoints: business invoices (owner), contact form."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from db import db
from models import now_iso, new_id, Invoice
from security import get_current_user, require_role

router = APIRouter(prefix="/api", tags=["public"])


class ContactForm(BaseModel):
    name: str
    email: EmailStr
    subject: str | None = None
    message: str


@router.post("/contact")
async def submit_contact(data: ContactForm):
    await db.contact_messages.insert_one({
        "id": new_id(),
        **data.model_dump(),
        "status": "new",
        "created_at": now_iso(),
    })
    return {"ok": True}


@router.get("/my-invoices", response_model=list[Invoice])
async def my_invoices(user: dict = Depends(require_role("business"))):
    biz_ids = [b["id"] async for b in db.businesses.find(
        {"owner_user_id": user["id"]}, {"id": 1, "_id": 0})]
    return await db.invoices.find(
        {"business_id": {"$in": biz_ids}}, {"_id": 0}
    ).sort("created_at", -1).to_list(200)


@router.get("/health")
async def health():
    return {"ok": True, "service": "mytown"}
