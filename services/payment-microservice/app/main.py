from fastapi import FastAPI
from app.db.database import wait_for_db
from app import models
from app.db.database import engine
from app.routes.payment_routes import router as payment_router

app = FastAPI(
    title="Payment Microservice",
    description="Handles payment escrow, release and refund via Stripe",
    version="0.1.0"
)


@app.on_event("startup")
def startup():
    wait_for_db()
    models.Base.metadata.create_all(bind=engine)


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "payment-microservice"}


app.include_router(payment_router)
