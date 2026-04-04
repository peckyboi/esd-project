from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app import database, models, rabbitmq_consumer, schemas

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Notification Microservice")

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
def startup_event():
    rabbitmq_consumer.start_consumer_in_background()


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "notification-microservice"}


@app.get("/notifications/{user_id}", response_model=list[schemas.NotificationResponse])
def get_notifications(
    user_id: int,
    db: Session = Depends(database.get_db),
):
    return (
        db.query(models.Notification)
        .filter(models.Notification.user_id == user_id)
        .order_by(models.Notification.created_at.desc())
        .all()
    )
