from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import wait_for_database, engine, Base
from app.service_client import init_client, close_client
from app.routes.chats import router as chats_router

app = FastAPI(title="Chat Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    wait_for_database()
    Base.metadata.create_all(bind=engine)
    await init_client()

@app.on_event("shutdown")
async def shutdown_event():
    await close_client()

app.include_router(chats_router)
