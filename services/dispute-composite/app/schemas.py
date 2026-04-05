from datetime import datetime
from decimal import Decimal
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class StartDisputeRequest(BaseModel):
    order_id: int
    actor_user_id: int
    reason: str = Field(min_length=1)


class StartDisputeResponse(BaseModel):
    order: dict[str, Any]
    chat: dict[str, Any]
    ws_url: str


class InboxItem(BaseModel):
    order_id: int
    chat_id: int
    other_user_id: int
    chat_status: Literal["OPEN", "CLOSED"]
    order_status: str
    latest_proposal_status: Optional[str] = None


class ChatBootstrapResponse(BaseModel):
    order_id: int
    chat_id: int
    ws_url: str
    messages: list[dict[str, Any]]
    chat_status: Literal["OPEN", "CLOSED"]
    latest_proposal: Optional["ProposalResponse"] = None


class CreateProposalRequest(BaseModel):
    proposer_id: int
    action: Literal["REFUND", "RELEASE"]
    amount: Optional[float] = None


class DecideProposalRequest(BaseModel):
    responder_id: int
    rejection_reason: Optional[str] = None


class ProposalResponse(BaseModel):
    id: int
    order_id: int
    proposer_id: int
    action: str
    amount: Optional[Decimal]
    status: str
    responder_id: Optional[int] = None
    rejection_reason: Optional[str] = None
    payment_id: Optional[int] = None
    payment_status: Optional[str] = None
    created_at: datetime
    decided_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class SettleResult(BaseModel):
    order: dict[str, Any]
    payment: dict[str, Any]
    proposal: ProposalResponse


ChatBootstrapResponse.model_rebuild()
