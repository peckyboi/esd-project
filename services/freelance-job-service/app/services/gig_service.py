from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.gig import Gig, GigStatus
from app.schemas.gig_schema import GigCreate, GigUpdate
from typing import Optional


def create_gig(db: Session, data: GigCreate) -> Gig:
    """Create a new gig listing."""
    gig = Gig(**data.model_dump())
    db.add(gig)
    db.commit()
    db.refresh(gig)
    return gig


def get_gig_by_id(db: Session, gig_id: int) -> Optional[Gig]:
    """Fetch a single gig by its ID (only active/paused, not deleted)."""
    return (
        db.query(Gig)
        .filter(Gig.gig_id == gig_id, Gig.status != GigStatus.deleted)
        .first()
    )


def get_gigs(
    db: Session,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    freelancer_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 20,
) -> list[Gig]:
    """
    Retrieve gigs with optional filtering.
    Used by Gig Catalog Composite Service for browsing.
    """
    query = db.query(Gig).filter(Gig.status == GigStatus.active)

    if category:
        query = query.filter(Gig.category.ilike(f"%{category}%"))
    if min_price is not None:
        query = query.filter(Gig.price >= min_price)
    if max_price is not None:
        query = query.filter(Gig.price <= max_price)
    if search:
        query = query.filter(
            or_(
                Gig.title.ilike(f"%{search}%"),
                Gig.description.ilike(f"%{search}%"),
            )
        )
    if freelancer_id:
        query = query.filter(Gig.freelancer_id == freelancer_id)

    return query.offset(skip).limit(limit).all()


def update_gig(db: Session, gig_id: int, data: GigUpdate) -> Optional[Gig]:
    """Update a gig's fields. Returns None if not found."""
    gig = get_gig_by_id(db, gig_id)
    if not gig:
        return None

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(gig, field, value)

    db.commit()
    db.refresh(gig)
    return gig


def delete_gig(db: Session, gig_id: int) -> bool:
    """
    Soft-delete a gig by setting status to 'deleted'.
    Returns True if deleted, False if not found.
    """
    gig = get_gig_by_id(db, gig_id)
    if not gig:
        return False

    gig.status = GigStatus.deleted
    db.commit()
    return True
