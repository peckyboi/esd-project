from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.gig import GigStatus


# ── Request Schemas ──────────────────────────────────────────────────────────

class GigCreate(BaseModel):
    freelancer_id: str = Field(..., description="ID of the freelancer who owns this gig")
    title: str = Field(..., min_length=5, max_length=255)
    description: str = Field(..., min_length=10)
    category: str = Field(..., max_length=100)
    price: float = Field(..., gt=0, description="Price must be greater than 0")
    delivery_days: int = Field(..., gt=0, description="Estimated delivery time in days")
    image_url: Optional[str] = Field(None, max_length=500)


class GigUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=255)
    description: Optional[str] = Field(None, min_length=10)
    category: Optional[str] = Field(None, max_length=100)
    price: Optional[float] = Field(None, gt=0)
    delivery_days: Optional[int] = Field(None, gt=0)
    image_url: Optional[str] = Field(None, max_length=500)
    status: Optional[GigStatus] = None


# ── Response Schemas ─────────────────────────────────────────────────────────

class GigResponse(BaseModel):
    gig_id: int
    freelancer_id: str
    title: str
    description: str
    category: str
    price: float
    delivery_days: int
    image_url: Optional[str]
    status: GigStatus
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True  # Pydantic v2 (replaces orm_mode)
