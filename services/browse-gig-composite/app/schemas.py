from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


# ── Response Schemas ─────────────────────────────────────────────────────────
class ReviewItem(BaseModel):
    """Single review as returned by the review microservice (camelCase input)."""

    model_config = ConfigDict(populate_by_name=True)

    order_id: int = Field(alias="orderId")
    gig_id: Optional[int] = Field(None, alias="gigId")
    client_id: Optional[int] = Field(None, alias="clientId")
    freelancer_id: Optional[int] = Field(None, alias="freelancerId")
    rating: Optional[int] = None
    message: Optional[str] = None
    created_at: Optional[datetime] = Field(None, alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")


class AggregatedGigResponse(BaseModel):
    gig_id: int
    freelancer_id: int
    title: str
    description: str
    category: str
    price: float
    delivery_days: int
    image_url: Optional[str]
    status: str
    # Aggregated fields
    rating: float
    review_count: int
    freelancer_name: str
    freelancer_image: Optional[str] = None



class FreelancerInfo(BaseModel):
    """Freelancer information from User microservice"""
    freelancer_id: int
    freelancer_name: str
    avatar: Optional[str] = None

    class Config:
        from_attributes = True


class GigListing(BaseModel):
    """Aggregated gig listing with freelancer and review information"""
    gig_id: int
    title: str
    description: str
    price: float
    delivery_days: int
    freelancer_name: str
    avatar: Optional[str] = None
    average_rating: Optional[float] = Field(None, description="Average rating for this gig (1-5)")
    review_count: int = Field(default=0, description="Number of reviews for this gig")
    review_list: list[ReviewItem] = Field(default_factory=list)

    class Config:
        from_attributes = True


class BrowseGigsResponse(BaseModel):
    """Response for browsing gigs with pagination metadata"""
    gigs: list[GigListing]
    total: int
    skip: int
    limit: int
