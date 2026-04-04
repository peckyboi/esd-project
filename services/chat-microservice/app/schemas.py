from datetime import datetime
from pydantic import BaseModel

class StartChatRequest(BaseModel):
    order_id: int
    user_id1: str
    user_id2: str

class StartChatResponse(BaseModel):
    chat_id: int
    room_url: str

class ChatRoomItem(BaseModel):
    chatId: int
    orderId: int
    userId1: str
    userId2: str
    status: str

class ChatHistoryItem(BaseModel):
    SenderId: str
    MessageText: str
    Timestamp: str | None = None
    ChatId: int

class SendMessageRequest(BaseModel):
    sender_id: str
    text: str

class MessageSaved(BaseModel):
    SenderId: str
    MessageText: str
    Timestamp: str | None = None
    ChatId: int