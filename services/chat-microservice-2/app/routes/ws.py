from collections import defaultdict

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.database import SessionLocal
from app.models import ChatMessage, ChatRoom

router = APIRouter(tags=["ws"])
rooms: dict[int, set[WebSocket]] = defaultdict(set)

#sends message to all sockets connects in the same chatroom
async def broadcast(chat_id: int, payload: dict):
    stale: list[WebSocket] = []
    for conn in list(rooms[chat_id]): #rooms[chat_id] stores the set of connected clients in the chat
        try:
            await conn.send_json(payload)
        except Exception:
            stale.append(conn)

    for conn in stale:
        rooms[chat_id].discard(conn)

#websocket endpoint based on chatid
@router.websocket("/ws/chats/{chat_id}")
async def websocket_chat(websocket: WebSocket, chat_id: int):
    await websocket.accept()
    rooms[chat_id].add(websocket)

    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("type")

            #sends an event on successful joined conversation
            if event_type == "join_conversation":
                await websocket.send_json({"type": "joined_conversation", "chatId": chat_id})
                continue
            
            #other event is send_message when message is sent
            if event_type != "send_message":
                #send socket error if message type is neither
                await websocket.send_json({"type": "socket_error", "message": "Unsupported event type"})
                continue

            sender_id = data.get("senderId") or data.get("userId")
            content = str(data.get("content", "")).strip()

            if sender_id is None or not content:
                await websocket.send_json({"type": "socket_error", "message": "Missing senderId/userId or content"})
                continue

            try:
                sender_id = int(sender_id)
            except (TypeError, ValueError):
                await websocket.send_json({"type": "socket_error", "message": "Invalid sender id"})
                continue

            db = SessionLocal()
            try:
                room = db.query(ChatRoom).filter(ChatRoom.chat_id == chat_id).first()
                if not room:
                    await websocket.send_json({"type": "socket_error", "message": "Chat not found"})
                    continue

                if sender_id not in {room.client_id, room.freelancer_id}:
                    await websocket.send_json({"type": "socket_error", "message": "Sender not in chat"})
                    continue

                message = ChatMessage(
                    chat_id=chat_id,
                    sender_id=sender_id,
                    content=content,
                )
                db.add(message)
                db.commit()
                db.refresh(message)

                room.updated_at = message.created_at
                db.commit()

                await broadcast(
                    chat_id,
                    {
                        "type": "receive_message",
                        "messageId": message.message_id,
                        "chatId": message.chat_id,
                        "senderId": message.sender_id,
                        "content": message.content,
                        "createdAt": message.created_at.isoformat() if message.created_at else None,
                    },
                )
            finally:
                db.close()
    #when we disconnect remove this socket
    except WebSocketDisconnect:
        rooms[chat_id].discard(websocket)
    finally:
        rooms[chat_id].discard(websocket)
        if not rooms[chat_id]:
            rooms.pop(chat_id, None)
