"""MyTown - DH Website Services
Local services marketplace backend (Pontypridd beta).
"""
import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from db import db, client  # noqa: E402
from routes import auth as auth_routes  # noqa: E402
from routes import categories as category_routes  # noqa: E402
from routes import businesses as business_routes  # noqa: E402
from routes import bookings as booking_routes  # noqa: E402
from routes import reviews as review_routes  # noqa: E402
from routes import admin as admin_routes  # noqa: E402
from routes import public as public_routes  # noqa: E402
from seeds import run_seeds  # noqa: E402

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="MyTown API", version="0.1.0-beta")

app.include_router(auth_routes.router)
app.include_router(category_routes.router)
app.include_router(business_routes.router)
app.include_router(booking_routes.router)
app.include_router(review_routes.router)
app.include_router(admin_routes.router)
app.include_router(public_routes.router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await run_seeds(db)
    logger.info("MyTown API started.")


@app.on_event("shutdown")
async def shutdown():
    client.close()
