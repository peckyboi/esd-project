from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["chat-page"])

@router.get("/health-chat-page")
def health_chat_page():
    return {"message": "chat_page router is working"}