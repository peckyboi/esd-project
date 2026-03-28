import asyncio
from typing import List, Optional

import httpx

from app.http_client import ServiceClient
from app.schemas import GigListing, ReviewItem



async def review_list_convert(raw: List[dict]) -> List[ReviewItem]:
    """Convert raw review dicts to ReviewItem models"""
    items: List[ReviewItem] = []
    for r in raw:
        try:
            cid = r.get("clientId")
            fid = r.get("freelancerId")
            cinfo = await ServiceClient.get_user_info(cid)
            client_name = cinfo.get("displayName")
            finfo = await ServiceClient.get_user_info(fid)
            freelancer_name = finfo.get("displayName")
            items.append(ReviewItem(
                **r,
                client_name=client_name,
                freelancer_name=freelancer_name,
            ))
        except Exception:
            continue
    return items

async def _enrich_gig_dict(gig: dict) -> GigListing:
    """Merge raw gig JSON with freelancer profile and gig-scoped reviews."""
    try:
        f_id = gig["freelancer_id"]
        gig_id = gig["gig_id"]
        user_info, reviews_raw = await asyncio.gather(
            ServiceClient.get_user_info(f_id),
            ServiceClient.get_reviews_by_gig(gig_id),
        )
        
        review_list = await review_list_convert(reviews_raw)

        avg_rating: Optional[float] = None
        if review_list:
            ratings = [r.rating for r in review_list if r.rating is not None]
            if ratings:
                avg_rating = round(sum(ratings) / len(ratings), 1)

        return GigListing(
            gig_id=gig_id,
            title=gig["title"],
            description=gig["description"],
            price=gig["price"],
            delivery_days=gig["delivery_days"],
            freelancer_name=user_info.get("displayName", "Unknown"),
            avatar=user_info.get("avatarUrl"),
            average_rating=avg_rating,
            review_count=len(review_list),
            review_list=review_list,
        )
    except Exception:
        return GigListing(
            gig_id=gig["gig_id"],
            title=gig.get("title", ""),
            description=gig.get("description", ""),
            price=float(gig.get("price", 0)),
            delivery_days=int(gig.get("delivery_days", 0)),
            freelancer_name="Service Unavailable",
            avatar=None,
            average_rating=None,
            review_count=0,
            review_list=[],
        )


async def get_aggregated_gigs(
    category: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
) -> List[GigListing]:
    """Fetches gigs and enriches each with freelancer profile and gig-scoped reviews."""
    gigs_data = await ServiceClient.get_gigs(
        category=category, search=search, skip=skip, limit=limit
    )
    return [await _enrich_gig_dict(gig) for gig in gigs_data]


async def get_aggregated_gig_by_id(gig_id: int) -> Optional[GigListing]:
    """Fetch one gig by id from the job service and return the same aggregated shape as browse."""
    try:
        gig = await ServiceClient.get_gig_by_id(gig_id)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            return None
        raise
    return await _enrich_gig_dict(gig)
