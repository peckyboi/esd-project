from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import wait_for_db
from app import models
from app.db.database import engine
from app.routes.payment_routes import router as payment_router

app = FastAPI(
    title="Payment Microservice",
    description="Handles payment escrow, release and refund via Stripe",
    version="0.1.0"
)

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


@app.on_event("startup")
def startup():
    wait_for_db()
    models.Base.metadata.create_all(bind=engine)


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "payment-microservice"}


app.include_router(payment_router)
