import os
from typing import Any

import httpx

ORDER_SERVICE_URL = os.getenv("ORDER_SERVICE_URL", "http://order-microservice:8000")
CHAT_SERVICE_URL = os.getenv("CHAT_SERVICE_URL", "http://chat-microservice-2:8090")
PAYMENT_SERVICE_URL = os.getenv("PAYMENT_SERVICE_URL", "http://payment-microservice:8002")
CHAT_WS_BASE_URL = os.getenv("CHAT_WS_BASE_URL", "ws://localhost:8090/ws/chats")

REQUEST_TIMEOUT = float(os.getenv("REQUEST_TIMEOUT", "15"))
_shared_client: httpx.AsyncClient | None = None


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
    async def get_order(order_id: int) -> dict[str, Any]:
        response = await get_client().get(f"{ORDER_SERVICE_URL}/orders/{order_id}")
        response.raise_for_status()
        return response.json()

    @staticmethod
    async def mark_disputed(order_id: int, reason: str) -> dict[str, Any]:
        response = await get_client().patch(
            f"{ORDER_SERVICE_URL}/orders/{order_id}/dispute",
            json={"dispute_reason": reason},
        )
        response.raise_for_status()
        return response.json()

    @staticmethod
    async def settle_order(order_id: int, action: str, amount: float | None) -> dict[str, Any]:
        final_status = "refunded" if action == "REFUND" else "released"
        response = await get_client().patch(
            f"{ORDER_SERVICE_URL}/orders/{order_id}/settle",
            json={"final_status": final_status, "settlement_amount": amount},
        )
        response.raise_for_status()
        return response.json()

    @staticmethod
    async def create_or_get_chat(order_id: int, client_id: int, freelancer_id: int) -> dict[str, Any]:
        response = await get_client().post(
            f"{CHAT_SERVICE_URL}/chats",
            json={
                "order_id": order_id,
                "client_id": client_id,
                "freelancer_id": freelancer_id,
            },
        )
        if response.status_code not in (200, 201):
            response.raise_for_status()
        return response.json()

    @staticmethod
    async def get_chat_messages(chat_id: int) -> list[dict[str, Any]]:
        response = await get_client().get(f"{CHAT_SERVICE_URL}/chats/{chat_id}/messages")
        response.raise_for_status()
        return response.json()

    @staticmethod
    async def list_payments() -> list[dict[str, Any]]:
        response = await get_client().get(f"{PAYMENT_SERVICE_URL}/payments")
        response.raise_for_status()
        return response.json()

    @staticmethod
    async def resolve_payment_for_order(order_id: int) -> dict[str, Any]:
        payments = await ServiceClient.list_payments()
        candidates = [p for p in payments if int(p.get("order_id", -1)) == int(order_id)]
        if not candidates:
            raise RuntimeError(f"No payment found for order {order_id}")

        held_candidates = [p for p in candidates if str(p.get("status", "")).lower() == "held"]
        if held_candidates:
            return held_candidates[0]
        return candidates[0]

    @staticmethod
    async def refund_payment(payment_id: int) -> dict[str, Any]:
        response = await get_client().patch(
            f"{PAYMENT_SERVICE_URL}/payments/refund",
            json={"payment_id": payment_id},
        )
        response.raise_for_status()
        return response.json()

    @staticmethod
    async def release_payment(payment_id: int) -> dict[str, Any]:
        response = await get_client().patch(
            f"{PAYMENT_SERVICE_URL}/payments/release",
            json={"payment_id": payment_id},
        )
        response.raise_for_status()
        return response.json()
