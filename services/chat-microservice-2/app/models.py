from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import text
from app.database import Base

#Stores models which are inherited by the database
class ChatRoom(Base):
    __tablename__ = "chat_rooms"

    chat_id = Column(Integer, primary_key=True, index = True)
    order_id = Column(Integer, nullable=False, index = True)
    client_id = Column(Integer, nullable=False, index=True)
    freelancer_id = Column(Integer, nullable=False, index=True)
    status = Column(String(50), nullable=False, default="active")

    #convert to Singapore time
    created_at = Column(
        DateTime, 
        server_default=text("CONVERT_TZ(NOW(), '+00:00', '+08:00')"), 
        nullable=False)
    updated_at = Column(
        DateTime,
        server_default=text("CONVERT_TZ(NOW(), '+00:00', '+08:00')"),
        onupdate=text("CONVERT_TZ(NOW(), '+00:00', '+08:00')"),
        nullable=False,
    )

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    message_id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chat_rooms.chat_id",ondelete="CASCADE"), nullable=False,index=True)
    sender_id = Column(Integer)
    content = Column(Text, nullable=False)
    created_at = Column(
        DateTime, 
        server_default=text("CONVERT_TZ(NOW(), '+00:00', '+08:00')"), 
        nullable=False)
