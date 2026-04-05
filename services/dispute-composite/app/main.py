from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.clients import close_client, init_client
from app.database import Base, engine, ensure_database_exists
from app.routes.disputes import router as disputes_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_database_exists()
    Base.metadata.create_all(bind=engine)
    await init_client()
    yield
    await close_client()


app = FastAPI(title="Dispute Composite Microservice", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "healthy", "service": "dispute-composite"}


app.include_router(disputes_router)
