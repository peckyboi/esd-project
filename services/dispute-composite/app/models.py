from sqlalchemy import Column, DateTime, Integer, Numeric, String, Text
from sqlalchemy.sql import func

from app.database import Base


class DisputeCase(Base):
    __tablename__ = "dispute_cases"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, nullable=False, unique=True, index=True)
    chat_id = Column(Integer, nullable=False, index=True)
    client_id = Column(Integer, nullable=False, index=True)
    freelancer_id = Column(Integer, nullable=False, index=True)
    reason = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="OPEN")
    final_action = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)


class SettlementProposal(Base):
    __tablename__ = "settlement_proposals"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, nullable=False, index=True)
    proposer_id = Column(Integer, nullable=False, index=True)
    action = Column(String(50), nullable=False)
    amount = Column(Numeric(10, 2), nullable=True)
    status = Column(String(50), nullable=False, default="PENDING")
    responder_id = Column(Integer, nullable=True)
    rejection_reason = Column(String(255), nullable=True)
    payment_id = Column(Integer, nullable=True)
    payment_status = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    decided_at = Column(DateTime, nullable=True)
