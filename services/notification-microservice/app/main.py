from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

from app import database, models, rabbitmq_consumer, schemas

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Notification Microservice")


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