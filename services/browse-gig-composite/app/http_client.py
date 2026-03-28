import httpx
import os
from typing import Optional, List, Dict, Any

FREELANCE_JOB_SERVICE_URL = os.getenv(
    "FREELANCE_JOB_SERVICE_URL", 
    "http://freelance-job-service:8084"
)
REVIEW_SERVICE_URL = os.getenv(
    "REVIEW_SERVICE_URL",
    "http://review-microservice:8085"
)
USER_SERVICE_URL = os.getenv(
    "USER_SERVICE_URL",
    "https://personal-43hivjqa.outsystemscloud.com/User/rest/User/"
)

REQUEST_TIMEOUT = 10

class ServiceClient:
    """HTTP client for calling dependent microservices with explicit error raising"""

    @staticmethod
    async def get_gigs(
        category: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        search: Optional[str] = None,
        freelancer_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> List[Dict[str, Any]]:
        """Fetch gigs from freelance-job-service. Raises exception on failure."""
        params = {"skip": skip, "limit": limit}
        if category: params["category"] = category
        if min_price is not None: params["min_price"] = min_price
        if max_price is not None: params["max_price"] = max_price
        if search: params["search"] = search
        if freelancer_id is not None: params["freelancer_id"] = freelancer_id

        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT, follow_redirects=True) as client:
            response = await client.get(
                f"{FREELANCE_JOB_SERVICE_URL}/gigs/",
                params=params
            )
            response.raise_for_status() 
            return response.json()

    @staticmethod
    async def get_gig_by_id(gig_id: int) -> Dict[str, Any]:
        """Fetch a specific gig. Raises exception if not found or service is down."""
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT, follow_redirects=True) as client:
            response = await client.get(
                f"{FREELANCE_JOB_SERVICE_URL}/gigs/{gig_id}"
            )
            response.raise_for_status()
            return response.json()

    @staticmethod
    async def get_reviews_by_freelancer(freelancer_id: int) -> List[Dict[str, Any]]:
        """Fetch reviews for a freelancer. Raises exception on communication failure."""
        params = {"freelancerId": freelancer_id}
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT, follow_redirects=True) as client:
            response = await client.get(
                f"{REVIEW_SERVICE_URL}/reviews",
                params=params
            )
            response.raise_for_status()
            return response.json()

    @staticmethod
    async def get_reviews_by_gig(gig_id: int) -> List[Dict[str, Any]]:
        """Fetch reviews for a specific gig. Raises exception on communication failure."""
        params = {"gigId": gig_id}
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT, follow_redirects=True) as client:
            response = await client.get(
                f"{REVIEW_SERVICE_URL}/reviews",
                params=params,
            )
            response.raise_for_status()
            return response.json()

    @staticmethod
    async def get_user_info(user_id: int) -> Dict[str, Any]:
        """Fetch user profile from the user service. Raises exception on failure."""
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT, follow_redirects=True) as client:
            response = await client.get(
                f"{USER_SERVICE_URL}/user/{user_id}",
                params={"UserId": user_id},
            )
            response.raise_for_status()
            return response.json()