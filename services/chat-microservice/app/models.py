from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func

from app.database import Base

class ChatRoom(Base):
    __tablename__ = "chat_rooms"

    chat_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, nullable=False, index=True)
    user_id1 = Column(String(255), nullable=False, index=True)
    user_id2 = Column(String(255), nullable=False, index=True)
    status = Column(
        Enum("active", "resolved", "closed", name="chat_room_status"),
        nullable=False,
        default="active",
    )
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    message_id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chat_rooms.chat_id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id = Column(String(255), nullable=False, index=True)
    message_text = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())