# services/chat_microservice/app/routes/ws.py
from collections import defaultdict
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()
rooms = defaultdict(list)

@router.websocket("/ws/{chat_id}")
async def websocket_chat(websocket: WebSocket, chat_id: str):
    await websocket.accept()
    rooms[chat_id].append(websocket)

    try:
        while True:
            data = await websocket.receive_json()
            for conn in list(rooms[chat_id]):
                await conn.send_json(data)
    except WebSocketDisconnect:
        if websocket in rooms[chat_id]:
            rooms[chat_id].remove(websocket)