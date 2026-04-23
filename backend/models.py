"""Pydantic models (response + request schemas).

MongoDB is used for now but the schema mirrors a normalized relational design
so it can be ported to Supabase/Postgres later with minimal changes.
"""
from datetime import datetime, timezone
from typing import List, Optional, Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict
import uuid


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id() -> str:
    return str(uuid.uuid4())


# ---------- Users ----------
UserRole = Literal["manager", "business", "customer"]
UserStatus = Literal["active", "suspended"]


class UserPublic(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: EmailStr
    username: str
    role: UserRole
    full_name: Optional[str] = None
    phone: Optional[str] = None
    status: UserStatus = "active"
    created_at: str


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=40)
    password: str = Field(min_length=6, max_length=128)
    role: Literal["business", "customer"]
    full_name: Optional[str] = None
    phone: Optional[str] = None


class LoginRequest(BaseModel):
    identifier: str  # email or username
    password: str


class AuthResponse(BaseModel):
    token: str
    user: UserPublic


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(min_length=6, max_length=128)


class AdminCreateUserRequest(BaseModel):
    email: EmailStr
    username: str
    password: str = Field(min_length=6)
    role: UserRole
    full_name: Optional[str] = None
    phone: Optional[str] = None


class UpdateUserRequest(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[UserStatus] = None
    role: Optional[UserRole] = None


# ---------- Categories ----------
class Category(BaseModel):
    id: str
    slug: str
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    active: bool = True


class CategoryInput(BaseModel):
    slug: str
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    active: bool = True


# ---------- Businesses ----------
BusinessStatus = Literal["draft", "pending", "published", "paused", "rejected"]


class OpeningHour(BaseModel):
    day: int  # 0-6 (Mon-Sun)
    open: Optional[str] = None  # "09:00"
    close: Optional[str] = None  # "17:00"
    closed: bool = False


class Business(BaseModel):
    id: str
    owner_user_id: str
    name: str
    slug: str
    description: Optional[str] = None
    category_slug: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    postcode: Optional[str] = None
    coverage_area: str = "Pontypridd"
    logo_url: Optional[str] = None
    gallery: List[str] = []
    opening_hours: List[OpeningHour] = []
    emergency_callout: bool = False
    price_from: Optional[float] = None
    status: BusinessStatus = "draft"
    verified: bool = False
    featured: bool = False
    rating_avg: float = 0
    rating_count: int = 0
    created_at: str
    updated_at: str


class BusinessInput(BaseModel):
    name: str
    description: Optional[str] = None
    category_slug: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    postcode: Optional[str] = None
    coverage_area: Optional[str] = "Pontypridd"
    logo_url: Optional[str] = None
    gallery: Optional[List[str]] = None
    opening_hours: Optional[List[OpeningHour]] = None
    emergency_callout: Optional[bool] = None
    price_from: Optional[float] = None


class BusinessAdminInput(BusinessInput):
    status: Optional[BusinessStatus] = None
    verified: Optional[bool] = None
    featured: Optional[bool] = None


# ---------- Services ----------
class Service(BaseModel):
    id: str
    business_id: str
    name: str
    description: Optional[str] = None
    duration_minutes: int = 60
    price_guidance: Optional[str] = None
    active: bool = True


class ServiceInput(BaseModel):
    name: str
    description: Optional[str] = None
    duration_minutes: int = 60
    price_guidance: Optional[str] = None
    active: bool = True


# ---------- Availability ----------
class AvailabilitySlot(BaseModel):
    id: str
    business_id: str
    day_of_week: int  # 0-6
    start_time: str  # "09:00"
    end_time: str  # "17:00"
    slot_minutes: int = 60


class AvailabilityInput(BaseModel):
    day_of_week: int
    start_time: str
    end_time: str
    slot_minutes: int = 60


# ---------- Bookings ----------
BookingStatus = Literal[
    "pending",
    "confirmed",
    "rejected",
    "reschedule_requested",
    "cancelled",
    "completed",
    "no_show",
]


class Booking(BaseModel):
    id: str
    customer_id: str
    business_id: str
    service_id: Optional[str] = None
    service_name: Optional[str] = None
    start_at: str  # ISO
    duration_minutes: int = 60
    status: BookingStatus = "pending"
    notes: Optional[str] = None
    created_at: str
    updated_at: str


class BookingCreate(BaseModel):
    business_id: str
    service_id: Optional[str] = None
    start_at: str
    duration_minutes: int = 60
    notes: Optional[str] = None


class BookingStatusUpdate(BaseModel):
    status: BookingStatus
    note: Optional[str] = None


# ---------- Reviews ----------
class Review(BaseModel):
    id: str
    booking_id: str
    customer_id: str
    business_id: str
    rating: int
    comment: Optional[str] = None
    hidden: bool = False
    created_at: str


class ReviewCreate(BaseModel):
    booking_id: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None


# ---------- Invoices ----------
InvoiceStatus = Literal["draft", "issued", "paid", "overdue", "cancelled"]


class InvoiceItem(BaseModel):
    description: str
    quantity: int = 1
    unit_amount: float
    total: float


class Invoice(BaseModel):
    id: str
    business_id: str
    number: str
    amount: float
    currency: str = "GBP"
    description: Optional[str] = None
    items: List[InvoiceItem] = []
    status: InvoiceStatus = "draft"
    due_date: Optional[str] = None
    created_at: str
    issued_by: str


class InvoiceInput(BaseModel):
    business_id: str
    description: Optional[str] = None
    items: List[InvoiceItem]
    due_date: Optional[str] = None
    status: InvoiceStatus = "issued"


class InvoiceStatusUpdate(BaseModel):
    status: InvoiceStatus
