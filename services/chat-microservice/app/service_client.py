import httpx
import os
from typing import Optional, List, Dict, Any


CHAT_MICROSERVICE_URL = os.getenv(
    "CHAT_MICROSERVICE_URL",
    "http://127.0.0.1:8090"
    # "http://chat_microservice:8090"
)

FREELANCE_JOB_SERVICE_URL = os.getenv(
    "FREELANCE_JOB_SERVICE_URL",
    "http://freelance-job-service:8084"
)

USER_SERVICE_URL = os.getenv(
    "USER_SERVICE_URL",
    "https://personal-43hivjqa.outsystemscloud.com/User/rest/User/"
)

REQUEST_TIMEOUT = float(os.getenv("REQUEST_TIMEOUT", "10"))
_shared_client: Optional[httpx.AsyncClient] = None


def get_client() -> httpx.AsyncClient:
    if _shared_client is None:
        raise RuntimeError("HTTP client not initialized. Call init_client() first.")
    return _shared_client


async def init_client() -> None:
    global _shared_client
    if _shared_client is None:
        _shared_client = httpx.AsyncClient(
            timeout=httpx.Timeout(REQUEST_TIMEOUT),
            follow_redirects=True,
            limits=httpx.Limits(max_connections=100, max_keepalive_connections=20),
        )


async def close_client() -> None:
    global _shared_client
    if _shared_client is not None:
        await _shared_client.aclose()
        _shared_client = None


class ServiceClient:
    @staticmethod
    async def start_chat(
        *,
        order_id: int,
        user_id1: int | str,
        user_id2: int | str,
    ) -> Dict[str, Any]:
        response = await get_client().post(
            f"{CHAT_MICROSERVICE_URL}/chats/start",
            json={
                "order_id": order_id,
                "user_id1": str(user_id1),
                "user_id2": str(user_id2),
            },
        )
        response.raise_for_status()
        return response.json()

    @staticmethod
    async def get_user_chats(user_id: int | str) -> List[Dict[str, Any]]:
        response = await get_client().get(
            f"{CHAT_MICROSERVICE_URL}/users/{user_id}/chats"
        )
        response.raise_for_status()
        return response.json()

    @staticmethod
    async def get_chat_messages(chat_id: int) -> List[Dict[str, Any]]:
        response = await get_client().get(
            f"{CHAT_MICROSERVICE_URL}/chats/{chat_id}/messages"
        )
        response.raise_for_status()
        return response.json()

    @staticmethod
    async def send_chat_message(
        *,
        chat_id: int,
        sender_id: int | str,
        text: str,
    ) -> Dict[str, Any]:
        response = await get_client().post(
            f"{CHAT_MICROSERVICE_URL}/chats/{chat_id}/messages",
            json={
                "sender_id": str(sender_id),
                "text": text,
            },
        )
        response.raise_for_status()
        return response.json()

    @staticmethod
    async def get_gigs(
        category: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        search: Optional[str] = None,
        user_id2: Optional[int] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> List[Dict[str, Any]]:
        params: Dict[str, Any] = {"skip": skip, "limit": limit}

        if category:
            params["category"] = category
        if min_price is not None:
            params["min_price"] = min_price
        if max_price is not None:
            params["max_price"] = max_price
        if search:
            params["search"] = search
        if user_id2 is not None:
            params["user_id2"] = user_id2

        response = await get_client().get(
            f"{FREELANCE_JOB_SERVICE_URL}/gigs/",
            params=params,
        )
        response.raise_for_status()
        return response.json()

    @staticmethod
    async def get_gig_by_id(gig_id: int) -> Dict[str, Any]:
        response = await get_client().get(
            f"{FREELANCE_JOB_SERVICE_URL}/gigs/{gig_id}"
        )
        response.raise_for_status()
        return response.json()

    @staticmethod
    async def get_user_info(user_id: int | str) -> Dict[str, Any]:
        response = await get_client().get(
            f"{USER_SERVICE_URL}/user/{user_id}",
            params={"UserId": user_id},
        )
        response.raise_for_status()
        return response.json()

    @staticmethod
    async def get_chat_page_details(
        *,
        chat_room: Dict[str, Any],
        current_user_id: int | str,
    ) -> Dict[str, Any]:
        user_id1 = str(chat_room.get("user_id1"))
        user_id2 = str(chat_room.get("user_id2"))

        other_user_id = user_id2 if str(current_user_id) == user_id1 else user_id1

        user_info: Dict[str, Any] = {}
        gig_info: Dict[str, Any] = {}

        try:
            user_info = await ServiceClient.get_user_info(other_user_id)
        except Exception:
            user_info = {
                "id": other_user_id,
                "name": other_user_id,
            }

        gig_lookup_id = chat_room.get("gig_id") or chat_room.get("order_id")
        if gig_lookup_id is not None:
            try:
                gig_info = await ServiceClient.get_gig_by_id(int(gig_lookup_id))
            except Exception:
                gig_info = {}

        other_user_name = (
            user_info.get("Name")
            or user_info.get("name")
            or user_info.get("Username")
            or user_info.get("username")
            or str(other_user_id)
        )

        return {
            "chat": {
                "chatId": chat_room.get("chat_id") or chat_room.get("chatId"),
                "currentUserId": str(current_user_id),
                "otherUserId": other_user_id,
                "otherUserName": other_user_name,
                "status": chat_room.get("status", "active"),
                "orderId": chat_room.get("order_id") or chat_room.get("orderId"),
                "gigId": chat_room.get("gig_id") or chat_room.get("gigId"),
            },
            "otherUser": {
                "userId": other_user_id,
                "displayName": other_user_name,
                "raw": user_info,
            },
            "gig": {
                "gigId": gig_info.get("id") or gig_info.get("gig_id") or gig_lookup_id,
                "title": gig_info.get("title") or gig_info.get("gigTitle"),
                "price": gig_info.get("price") or gig_info.get("budget"),
                "deliveryTime": gig_info.get("delivery_time") or gig_info.get("deliveryTime"),
                "user_id2": gig_info.get("user_id2") or user_id2,
                "user_id2_name": other_user_name,
                "status": chat_room.get("status", "active"),
                "statusMessage": "Client has raised a dispute. Resolve through chat or issue a refund.",
                "actionPrimary": "Resolve Dispute",
                "actionSecondary": "Issue Refund",
                "actionMessage": "Disputes are handled through direct communication. If unresolved, refund is processed.",
                "raw": gig_info,
            },
        }