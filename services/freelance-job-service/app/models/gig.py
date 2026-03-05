from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Enum
from sqlalchemy.sql import func
from app.db.database import Base
import enum


class GigStatus(str, enum.Enum):
    active = "active"
    paused = "paused"
    deleted = "deleted"


class Gig(Base):
    __tablename__ = "gigs"

    gig_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    freelancer_id = Column(String(100), nullable=False, index=True)  # references User microservice
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    price = Column(Float, nullable=False)
    delivery_days = Column(Integer, nullable=False)
    image_url = Column(String(500), nullable=True)
    status = Column(Enum(GigStatus), default=GigStatus.active, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
