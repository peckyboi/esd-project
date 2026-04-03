import enum
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from app.models import OrderStatus

#unique pydantic way of declaring classes
#basemodel helps write the init for us and locks the data types it can accept
#comes with model_dump() method which helps instantly translate object into JSON

#what we expect from the client (API Gateway/ Frontend)
class OrderCreate(BaseModel):
    client_id: int
    freelancer_id: int
    gig_id: int
    price: float
    order_description: Optional[str] = None


class DisputeOrderRequest(BaseModel):
    dispute_reason: str


class SettleOrderRequest(BaseModel):
    final_status: OrderStatus
    settlement_amount: Optional[float] = None


class PaymentResultStatus(str, enum.Enum):
    HELD = "held"
    FAILED = "failed"


class PaymentResultRequest(BaseModel):
    payment_id: int
    payment_status: PaymentResultStatus


class PaymentReleaseStatus(str, enum.Enum):
    RELEASED = "released"


class PaymentReleaseResultRequest(BaseModel):
    payment_id: int
    payment_status: PaymentReleaseStatus


#what we return the client 
class OrderResponse(BaseModel):
    id: int
    client_id: int
    freelancer_id: int
    gig_id : int
    price: float
    order_description: Optional[str] = None
    status: OrderStatus
    created_at: datetime
    
    payment_transaction_id: Optional[str] = None
    dispute_reason: Optional[str] = None
    settlement_amount: Optional[float] = None
    disputed_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
