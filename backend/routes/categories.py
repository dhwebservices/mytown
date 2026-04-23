from fastapi import APIRouter, Depends, HTTPException
from db import db
from models import Category, CategoryInput, new_id
from security import require_role

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[Category])
async def list_categories():
    cats = await db.categories.find({"active": True}, {"_id": 0}).to_list(100)
    return cats


@router.post("", response_model=Category)
async def create_category(data: CategoryInput, _=Depends(require_role("manager"))):
    if await db.categories.find_one({"slug": data.slug}):
        raise HTTPException(400, "Slug already exists")
    doc = {"id": new_id(), **data.model_dump()}
    await db.categories.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.put("/{cat_id}", response_model=Category)
async def update_category(cat_id: str, data: CategoryInput, _=Depends(require_role("manager"))):
    await db.categories.update_one({"id": cat_id}, {"$set": data.model_dump()})
    cat = await db.categories.find_one({"id": cat_id}, {"_id": 0})
    if not cat:
        raise HTTPException(404, "Not found")
    return cat


@router.delete("/{cat_id}")
async def delete_category(cat_id: str, _=Depends(require_role("manager"))):
    await db.categories.update_one({"id": cat_id}, {"$set": {"active": False}})
    return {"ok": True}
