from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ChatRoom, ChatMessage
from app.schemas import (
    CreateChatRequest,
    ChatRoomResponse,
    SendMessageRequest,
    MessageResponse,
)

router = APIRouter(tags=["chats"])

@router.post("/chats", response_model=ChatRoomResponse, status_code=201)
def create_or_get_chat(payload: CreateChatRequest, db:Session= Depends(get_db)):
    existing = (
        db.query(ChatRoom)
        .filter(
            and_(
                ChatRoom.client_id == payload.client_id,
                ChatRoom.freelancer_id == payload.freelancer_id,
                ChatRoom.order_id == payload.order_id,
            )
        )
        .first()
    )

    #if chatroom exists
    if(existing): return existing

    #if chatroom doesn't exist, create a new chatroom
    room = ChatRoom(
        order_id=payload.order_id,
        client_id=payload.client_id,
        freelancer_id=payload.freelancer_id,
        status="active",
    )
    db.add(room)
    db.commit()
    db.refresh(room)
    return room

#get chats based on userid, note chats are identified using their chatid
@router.get("/users/{user_id}/chats", response_model=List[ChatRoomResponse])
def get_user_chats(user_id: int, db: Session = Depends(get_db)):
    rows = (
        db.query(ChatRoom)
        .filter(
            or_(
                ChatRoom.client_id == user_id,
                ChatRoom.freelancer_id == user_id,
            )
        )
        .order_by(ChatRoom.updated_at.desc(), ChatRoom.chat_id.desc())
        .all()
    )
    return rows

# gets specific chat that already exists, otherwise throw error if it doesn't
# used to get metadata of a chat
@router.get("/chats/{chat_id}", response_model=ChatRoomResponse)
def get_chat(chat_id: int, db: Session = Depends(get_db)):
    room = db.query(ChatRoom).filter(ChatRoom.chat_id == chat_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Chat not found")
    return room

# used to get actual messages of a chat when you click into it so the different messages for that chat
@router.get("/chats/{chat_id}/messages", response_model=List[MessageResponse])
def get_chat_messages(chat_id: int, db: Session = Depends(get_db)):
    room = db.query(ChatRoom).filter(ChatRoom.chat_id == chat_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Chat not found")

    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.chat_id == chat_id)
        .order_by(ChatMessage.created_at.asc(), ChatMessage.message_id.asc())
        .all()
    )
    return rows

#rest api fallback and for swagger testing in case messages cannot send via sockets
@router.post("/chats/{chat_id}/messages", response_model=MessageResponse, status_code=201)
def send_message(chat_id: int, payload: SendMessageRequest, db: Session = Depends(get_db)):
    room = db.query(ChatRoom).filter(ChatRoom.chat_id == chat_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Chat not found")

    if payload.sender_id not in {room.client_id, room.freelancer_id}:
        raise HTTPException(status_code=403, detail="Sender not in chat")

    text = payload.content.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Message content is required")

    message = ChatMessage(
        chat_id=chat_id,
        sender_id=payload.sender_id,
        content=text,
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    room.updated_at = message.created_at
    db.commit()

    return message
