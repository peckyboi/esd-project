from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.schemas.gig_schema import GigCreate, GigUpdate, GigResponse
from app.services import gig_service

router = APIRouter(prefix="/gigs", tags=["Gigs"])


@router.post("/", response_model=GigResponse, status_code=201)
def create_gig(payload: GigCreate, db: Session = Depends(get_db)):
    """
    Create a new gig listing.
    Called by a freelancer when posting a new service.
    """
    gig = gig_service.create_gig(db, payload)
    return gig


@router.get("/", response_model=list[GigResponse])
def list_gigs(
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    search: Optional[str] = Query(None, description="Search in title and description"),
    freelancer_id: Optional[int] = Query(None, description="Filter by freelancer"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Max results to return"),
    db: Session = Depends(get_db),
):
    """
    List and filter active gigs.
    Called by Gig Catalog Composite Service for browsing (Scenario 1, step 1.2).
    """
    return gig_service.get_gigs(
        db,
        category=category,
        min_price=min_price,
        max_price=max_price,
        search=search,
        freelancer_id=freelancer_id,
        skip=skip,
        limit=limit,
    )


@router.get("/{gig_id}", response_model=GigResponse)
def get_gig(gig_id: int, db: Session = Depends(get_db)):
    """
    Get a single gig by ID.
    Called by Gig Catalog Composite Service to fetch gig details before placing order.
    """
    gig = gig_service.get_gig_by_id(db, gig_id)
    if not gig:
        raise HTTPException(status_code=404, detail=f"Gig {gig_id} not found")
    return gig


@router.put("/{gig_id}", response_model=GigResponse)
def update_gig(gig_id: int, payload: GigUpdate, db: Session = Depends(get_db)):
    """
    Update a gig listing (title, description, price, status, etc.).
    Called by a freelancer to edit their posted gig.
    """
    gig = gig_service.update_gig(db, gig_id, payload)
    if not gig:
        raise HTTPException(status_code=404, detail=f"Gig {gig_id} not found")
    return gig


@router.delete("/{gig_id}", status_code=200)
def delete_gig(gig_id: int, db: Session = Depends(get_db)):
    """
    Soft-delete a gig (sets status to 'deleted', data is preserved).
    Called by a freelancer to remove their gig from the platform.
    """
    deleted = gig_service.delete_gig(db, gig_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Gig {gig_id} not found")
    return {"message": f"Gig {gig_id} has been deleted", "gig_id": gig_id}
