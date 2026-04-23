"""Seed defaults: categories + default manager account.
NO demo businesses, bookings, reviews, or customer accounts.
"""
import os
import logging
from security import hash_password
from models import now_iso, new_id

logger = logging.getLogger(__name__)

DEFAULT_CATEGORIES = [
    {"slug": "plumbing", "name": "Plumbing", "icon": "wrench", "description": "Leaks, boilers, installations, emergency callouts."},
    {"slug": "electrical", "name": "Electrical", "icon": "zap", "description": "Rewiring, EV chargers, lighting, safety certificates."},
    {"slug": "painting-decorating", "name": "Painting & Decorating", "icon": "paintbrush", "description": "Interior, exterior, plastering, wallpapering."},
    {"slug": "cleaning", "name": "Cleaning", "icon": "sparkles", "description": "End of tenancy, deep clean, regular domestic."},
    {"slug": "handyman", "name": "Handyman", "icon": "hammer", "description": "Small jobs, repairs, assembly, odd jobs."},
    {"slug": "landscaping", "name": "Landscaping & Gardening", "icon": "trees", "description": "Lawns, hedges, fencing, patios."},
    {"slug": "roofing", "name": "Roofing", "icon": "home", "description": "Repairs, gutters, flat roofs, chimneys."},
    {"slug": "carpentry", "name": "Carpentry & Joinery", "icon": "ruler", "description": "Doors, skirting, bespoke woodwork."},
    {"slug": "locksmith", "name": "Locksmith", "icon": "key-round", "description": "Lockouts, lock upgrades, key cutting."},
    {"slug": "removals", "name": "Removals", "icon": "truck", "description": "Local man-with-a-van, house removals."},
]

DEFAULT_ADMIN_EMAIL = os.environ.get("DEFAULT_ADMIN_EMAIL", "admin@mytown.co.uk")
DEFAULT_ADMIN_USERNAME = os.environ.get("DEFAULT_ADMIN_USERNAME", "admin")
DEFAULT_ADMIN_PASSWORD = os.environ.get("DEFAULT_ADMIN_PASSWORD", "MyTownAdmin!2026")


async def seed_categories(db):
    for cat in DEFAULT_CATEGORIES:
        existing = await db.categories.find_one({"slug": cat["slug"]})
        if not existing:
            await db.categories.insert_one({
                "id": new_id(),
                **cat,
                "active": True,
            })


async def seed_admin(db):
    existing = await db.users.find_one({"username": DEFAULT_ADMIN_USERNAME})
    if existing:
        return
    await db.users.insert_one({
        "id": new_id(),
        "email": DEFAULT_ADMIN_EMAIL.lower(),
        "username": DEFAULT_ADMIN_USERNAME.lower(),
        "password_hash": hash_password(DEFAULT_ADMIN_PASSWORD),
        "role": "manager",
        "full_name": "MyTown Admin",
        "phone": None,
        "status": "active",
        "email_verified": True,
        "created_at": now_iso(),
    })
    logger.info("Seeded default admin user: %s", DEFAULT_ADMIN_USERNAME)


async def run_seeds(db):
    await seed_categories(db)
    await seed_admin(db)
