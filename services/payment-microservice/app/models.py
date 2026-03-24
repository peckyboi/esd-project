from sqlalchemy import Column, Integer, String, Numeric, Enum, DateTime
from sqlalchemy.sql import func
from app.db.database import Base
import enum


class PaymentStatus(str, enum.Enum):
    held = "held"
    released = "released"
    refunded = "refunded"
    failed = "failed"


class Payment(Base):
    __tablename__ = "payments"

    payment_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    order_id = Column(Integer, nullable=False)
    client_id = Column(Integer, nullable=False)
    freelancer_id = Column(Integer, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(PaymentStatus), nullable=False, default=PaymentStatus.held)
    stripe_payment_intent_id = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
