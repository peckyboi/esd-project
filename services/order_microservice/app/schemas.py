from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from app.models import OrderStatus

#unique pydantic way of declaring classes
#basemodel helps write the init for us and locks the data types it can accept
#comes with model_dump() method which helps instantly translate object into JSON

#what we expect from the client (API Gateway/ Frontend)
class OrderCreate(BaseModel):
    client_id: str
    freelancer_id: str
    gig_id: int
    price: float


class DisputeOrderRequest(BaseModel):
    dispute_reason: str


class SettleOrderRequest(BaseModel):
    final_status: OrderStatus
    settlement_amount: Optional[float] = None


#what we return the client 
class OrderResponse(BaseModel):
    id: int
    client_id: str
    freelancer_id: str
    gig_id : int
    price: float
    status: OrderStatus
    created_at: datetime
    
    payment_transaction_id: Optional[str] = None
    dispute_reason: Optional[str] = None
    settlement_amount: Optional[float] = None
    disputed_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
