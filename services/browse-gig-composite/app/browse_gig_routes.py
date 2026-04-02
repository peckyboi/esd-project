# Updated app/browse_gig_routes.py
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.service import get_aggregated_gig_by_id, get_aggregated_gigs
from app.schemas import GigListing

router = APIRouter()


@router.get("/browse/gigs", response_model=List[GigListing])
async def browse_catalog(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 20,
):
    """List gigs with aggregated freelancer and review data."""
    return await get_aggregated_gigs(category, search, skip, limit)


@router.get("/browse/gigs/{gig_id}", response_model=GigListing)
async def get_gig_detail(gig_id: int):
    """Return a single gig by id in the same aggregated shape as the browse list."""
    gig = await get_aggregated_gig_by_id(gig_id)
    if gig is None:
        raise HTTPException(status_code=404, detail=f"Gig {gig_id} not found")
    return gig
