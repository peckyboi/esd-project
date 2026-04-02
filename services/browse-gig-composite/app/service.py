import asyncio
from typing import List, Optional
import httpx
from app.http_client import ServiceClient
from app.schemas import GigListing, ReviewItem

async def fetch_users_batch(user_ids: List[int]) -> dict[int, dict]:
    """De-duplicate IDs, fetch all users in parallel, return dict keyed by user_id."""
    unique_ids = list (set(user_ids))
    
    async def safe_fetch(uid: int):
        try:
            return uid, await ServiceClient.get_user_info(uid)
        except Exception:
            return uid, {}
        
    results = await asyncio.gather(*[safe_fetch(uid) for uid in unique_ids])
    return dict(results)

async def review_list_convert(raw: List[dict], user_cache: dict[int, dict]) -> List[ReviewItem]:
    """Convert raw review dicts to ReviewItem models"""
    items = []
    for r in raw:
        try:
            items.append(ReviewItem(
                **r,
                client_name=user_cache.get(r.get("clientId"), {}).get("displayName", "Unknown"),
                freelancer_name=user_cache.get(r.get("freelancerId"), {}).get("displayName", "Unknown"),
            ))
        except Exception:
            continue
    return items

async def enrich_gig_dict(gig: dict, user_cache: dict[int, dict]) -> GigListing:
    """Merge raw gig JSON with freelancer profile and gig-scoped reviews."""
    
    f_id = gig["freelancer_id"]
    gig_id = gig["gig_id"]
    
    user_info = user_cache.get(f_id, {})
    freelancer_name = user_info.get("displayName", "Unknown")
    avatar = user_info.get("avatarUrl")
    
    try: 
        reviews_raw = await ServiceClient.get_reviews_by_gig(gig_id)
        review_list = await review_list_convert(reviews_raw, user_cache)
    except Exception:
        review_list = []

    ratings = [r.rating for r in review_list if r.rating is not None]
    avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else None

    return GigListing(
        gig_id=gig_id,
        title=gig["title"],
        description=gig["description"],
        price=gig["price"],
        delivery_days=gig["delivery_days"],
        freelancer_name=freelancer_name,
        avatar=avatar,
        average_rating=avg_rating,
        review_count=len(review_list),
        review_list=review_list,
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
    if not gigs_data:
        return []
    
    user_cache = await fetch_users_batch([gig["freelancer_id"] for gig in gigs_data])   
    
    return list(await asyncio.gather(
        *[enrich_gig_dict(gig, user_cache) for gig in gigs_data]
    ))


async def get_aggregated_gig_by_id(gig_id: int) -> Optional[GigListing]:
    """Fetch one gig by id from the job service and return the same aggregated shape as browse."""
    try:
        gig = await ServiceClient.get_gig_by_id(gig_id)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            return None
        raise
    user_cache = await fetch_users_batch([gig["freelancer_id"]])
    return await enrich_gig_dict(gig, user_cache)
