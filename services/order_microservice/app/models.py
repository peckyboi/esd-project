from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
import enum
from app.database import Base

#lifecycle states
class OrderStatus(str, enum.Enum):
    PENDING_PAYMENT = "pending_payment"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    PAYMENT_FAILED = "payment_failed"
    DELIVERED = "delivered"
    DISPUTED = "disputed"
    REFUNDED = "refunded"
    RELEASED = "released"

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    dispute_reason = Column(String(500), nullable=True)
    settlement_amount = Column(Float, nullable=True)
    disputed_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    
    # foreign key referencing other microservies
    client_id = Column(Integer, index=True, nullable=False) 
    freelancer_id = Column(Integer, index=True, nullable=False)
    gig_id = Column(Integer, index=True, nullable=False)
    
    # order details
    price = Column(Float, nullable=False)
    status = Column(String(50), default=OrderStatus.PENDING_PAYMENT.value, nullable=False)
    payment_transaction_id = Column(String(100), nullable=True) 

    # timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ProcessedEvent(Base):
    __tablename__ = "processed_events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(100), unique=True, index=True, nullable=False)
    event_type = Column(String(100), nullable=False)
    processed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
