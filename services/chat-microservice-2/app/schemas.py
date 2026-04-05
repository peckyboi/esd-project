from datetime import datetime
from pydantic import BaseModel, Field

class CreateChatRequest(BaseModel):
    order_id: int
    client_id: int
    freelancer_id: int

class ChatRoomResponse(BaseModel):
    chat_id: int
    order_id: int
    client_id: int
    freelancer_id: int
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class SendMessageRequest(BaseModel):
    sender_id: int
    content: str = Field(min_length=1)

class MessageResponse(BaseModel):
    message_id: int
    chat_id: int
    sender_id: int
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}
