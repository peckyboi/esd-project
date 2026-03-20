from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models import PaymentStatus


class HoldPaymentRequest(BaseModel):
    order_id: int
    client_id: int
    freelancer_id: int
    amount: float


class ReleasePaymentRequest(BaseModel):
    payment_id: int


class RefundPaymentRequest(BaseModel):
    payment_id: int


class PaymentResponse(BaseModel):
    payment_id: int
    order_id: int
    client_id: int
    freelancer_id: int
    amount: float
    status: PaymentStatus
    stripe_payment_intent_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
