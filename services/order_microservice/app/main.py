import os
from datetime import datetime, timezone
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.orm import Session

from app import database, models, rabbitmq_consumer, rabbitmq_pub, schemas

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Order Microservice")

#allowed status changes so each bracket dictates what is allowed
ALLOWED_TRANSITIONS = {
    models.OrderStatus.PENDING_PAYMENT: {
        models.OrderStatus.IN_PROGRESS,
        models.OrderStatus.PAYMENT_FAILED,
        models.OrderStatus.CANCELLED,
    },
    models.OrderStatus.IN_PROGRESS: {models.OrderStatus.DELIVERED, models.OrderStatus.CANCELLED},
    models.OrderStatus.DELIVERED: {models.OrderStatus.COMPLETED, models.OrderStatus.DISPUTED},
    models.OrderStatus.DISPUTED: {models.OrderStatus.REFUNDED, models.OrderStatus.RELEASED},
}


def _get_order_or_404(db: Session, order_id: int):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order {order_id} not found",
        )
    return order


def _enforce_transition(current: models.OrderStatus, target: models.OrderStatus):
    allowed = ALLOWED_TRANSITIONS.get(current, set())
    if target not in allowed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Invalid status transition: {current.value} -> {target.value}",
        )

#api endpoints
@app.on_event("startup")
def startup_event():
    rabbitmq_consumer.start_consumer_in_background()


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "order-microservice"}


@app.post("/orders", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_request: schemas.OrderCreate, db: Session = Depends(database.get_db)):
    try:
        new_order = models.Order(
            client_id=order_request.client_id,
            freelancer_id=order_request.freelancer_id,
            gig_id=order_request.gig_id,
            price=order_request.price,
        )

        db.add(new_order)
        db.commit()
        db.refresh(new_order)

        try:
            rabbitmq_pub.publish_order_created_event(new_order)
        except Exception as err:
            print(f"Failed to publish to RabbitMQ: {err}")

        return new_order
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create order")


@app.get("/orders/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(database.get_db)):
    return _get_order_or_404(db, order_id)


@app.get("/orders", response_model=list[schemas.OrderResponse])
def list_orders(
    client_id: Optional[str] = None,
    freelancer_id: Optional[str] = None,
    status_filter: Optional[models.OrderStatus] = None,
    db: Session = Depends(database.get_db),
):
    query = db.query(models.Order)

    if client_id:
        query = query.filter(models.Order.client_id == client_id)
    if freelancer_id:
        query = query.filter(models.Order.freelancer_id == freelancer_id)
    if status_filter:
        query = query.filter(models.Order.status == status_filter)

    return query.order_by(models.Order.created_at.desc()).all()


@app.patch("/orders/{order_id}/deliver", response_model=schemas.OrderResponse)
def deliver_order(order_id: int, db: Session = Depends(database.get_db)):
    order = _get_order_or_404(db, order_id)
    _enforce_transition(order.status, models.OrderStatus.DELIVERED)
    order.status = models.OrderStatus.DELIVERED
    db.commit()
    db.refresh(order)
    try:
        rabbitmq_pub.publish_order_delivered_event(order)
        rabbitmq_pub.publish_order_status_updated_event(order)
    except Exception as err:
        print(f"Failed to publish to RabbitMQ: {err}")
    return order


@app.patch("/orders/{order_id}/approve", response_model=schemas.OrderResponse)
def approve_order(order_id: int, db: Session = Depends(database.get_db)):
    order = _get_order_or_404(db, order_id)
    _enforce_transition(order.status, models.OrderStatus.COMPLETED)
    order.status = models.OrderStatus.COMPLETED
    db.commit()
    db.refresh(order)
    try:
        rabbitmq_pub.publish_order_completed_event(order)
        rabbitmq_pub.publish_order_status_updated_event(order)
    except Exception as err:
        print(f"Failed to publish to RabbitMQ: {err}")
    return order


@app.patch("/orders/{order_id}/dispute", response_model=schemas.OrderResponse)
def dispute_order(
    order_id: int,
    request: schemas.DisputeOrderRequest,
    db: Session = Depends(database.get_db),
):
    order = _get_order_or_404(db, order_id)
    _enforce_transition(order.status, models.OrderStatus.DISPUTED)
    order.status = models.OrderStatus.DISPUTED
    order.dispute_reason = request.dispute_reason
    order.disputed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(order)
    try:
        rabbitmq_pub.publish_order_disputed_event(order)
        rabbitmq_pub.publish_order_status_updated_event(order)
    except Exception as err:
        print(f"Failed to publish to RabbitMQ: {err}")
    return order


@app.patch("/orders/{order_id}/settle", response_model=schemas.OrderResponse)
def settle_order(
    order_id: int,
    request: schemas.SettleOrderRequest,
    db: Session = Depends(database.get_db),
):
    order = _get_order_or_404(db, order_id)
    if request.final_status not in {models.OrderStatus.REFUNDED, models.OrderStatus.RELEASED}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="final_status must be refunded or released",
        )

    if request.settlement_amount is not None and request.settlement_amount != order.price:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Partial settlement is not supported; settlement_amount must equal order price",
        )

    _enforce_transition(order.status, request.final_status)
    order.status = request.final_status
    order.settlement_amount = order.price
    order.resolved_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(order)
    try:
        rabbitmq_pub.publish_order_status_updated_event(order)
    except Exception as err:
        print(f"Failed to publish to RabbitMQ: {err}")
    return order


@app.patch("/orders/{order_id}/cancel", response_model=schemas.OrderResponse)
def cancel_order(order_id: int, db: Session = Depends(database.get_db)):
    order = _get_order_or_404(db, order_id)
    _enforce_transition(order.status, models.OrderStatus.CANCELLED)
    order.status = models.OrderStatus.CANCELLED
    db.commit()
    db.refresh(order)
    try:
        rabbitmq_pub.publish_order_cancelled_event(order)
        rabbitmq_pub.publish_order_status_updated_event(order)
    except Exception as err:
        print(f"Failed to publish to RabbitMQ: {err}")
    return order

#temporary endpoint to simulate payment success
@app.patch("/orders/{order_id}/payment-success", response_model=schemas.OrderResponse)
def payment_success(order_id: int, db: Session = Depends(database.get_db)):
    if os.getenv("ENABLE_DEV_ENDPOINTS", "false").lower() != "true":
        raise HTTPException(status_code=404, detail="Not found")
    
    order = _get_order_or_404(db, order_id)
    _enforce_transition(order.status, models.OrderStatus.IN_PROGRESS)
    order.status = models.OrderStatus.IN_PROGRESS
    db.commit()
    db.refresh(order)
    return order
