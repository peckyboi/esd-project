from datetime import timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models import ChatRoom, ChatMessage
from app.schemas import (
    StartChatRequest,
    StartChatResponse,
    ChatRoomItem,
    ChatHistoryItem,
    SendMessageRequest,
    MessageSaved,
)

router = APIRouter(tags=["chats"])


def to_iso_z(dt):
    if not dt:
        return None
    return dt.replace(tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")


@router.post("/chats/start", response_model=StartChatResponse, status_code=201)
def start_chat(payload: StartChatRequest, db: Session = Depends(get_db)):
    existing = (
        db.query(ChatRoom)
        .filter(
            ChatRoom.order_id == payload.order_id,
            ChatRoom.user_id1 == payload.user_id1,
            ChatRoom.user_id2 == payload.user_id2,
        )
        .first()
    )

    if existing:
        return {
            "chat_id": existing.chat_id,
            "room_url": f"/chat/{existing.chat_id}",
        }

    new_room = ChatRoom(
        order_id=payload.order_id,
        user_id1=payload.user_id1,
        user_id2=payload.user_id2,
        status="active",
    )
    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    return {
        "chat_id": new_room.chat_id,
        "room_url": f"/chat/{new_room.chat_id}",
    }


@router.get("/users/{user_id}/chats", response_model=List[ChatRoomItem])
def get_user_chats(user_id: str, db: Session = Depends(get_db)):
    rows = (
        db.query(ChatRoom)
        .filter(
            or_(
                ChatRoom.user_id1 == user_id,
                ChatRoom.user_id2 == user_id,
            )
        )
        .order_by(ChatRoom.updated_at.desc(), ChatRoom.chat_id.desc())
        .all()
    )

    return [
        {
            "chatId": row.chat_id,
            "orderId": row.order_id,
            "userId1": row.user_id1,
            "userId2": row.user_id2,
            "status": row.status,
            "created_at": row.created_at,
            "updated_at": row.updated_at,
        }
        for row in rows
    ]


@router.get("/chats/{chat_id}/messages", response_model=List[ChatHistoryItem])
def get_chat_messages(chat_id: int, db: Session = Depends(get_db)):
    room = db.query(ChatRoom).filter(ChatRoom.chat_id == chat_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Chat room not found")

    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.chat_id == chat_id)
        .order_by(ChatMessage.created_at.asc(), ChatMessage.message_id.asc())
        .all()
    )

    return [
        {
            "SenderId": row.sender_id,
            "MessageText": row.message_text,
            "Timestamp": to_iso_z(row.created_at),
            "ChatId": row.chat_id,
        }
        for row in rows
    ]


@router.post("/chats/{chat_id}/messages", response_model=MessageSaved, status_code=201)
def send_message(chat_id: int, payload: SendMessageRequest, db: Session = Depends(get_db)):
    room = db.query(ChatRoom).filter(ChatRoom.chat_id == chat_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Chat room not found")

    message = ChatMessage(
        chat_id=chat_id,
        sender_id=payload.sender_id,
        message_text=payload.text,
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    room.updated_at = message.created_at
    db.commit()

    return {
        "SenderId": message.sender_id,
        "MessageText": message.message_text,
        "Timestamp": to_iso_z(message.created_at),
        "ChatId": message.chat_id,
    }


@router.get("/api/chat/{chat_id}/history", response_model=List[ChatHistoryItem])
def legacy_get_chat_history(chat_id: int, db: Session = Depends(get_db)):
    return get_chat_messages(chat_id, db)


@router.get("/disputes/{user_id}", response_model=List[ChatRoomItem])
def legacy_get_disputes(user_id: str, db: Session = Depends(get_db)):
    return get_user_chats(user_id, db)


@router.post("/disputes", response_model=StartChatResponse, status_code=201)
def legacy_create_dispute(payload: StartChatRequest, db: Session = Depends(get_db)):
    return start_chat(payload, db)