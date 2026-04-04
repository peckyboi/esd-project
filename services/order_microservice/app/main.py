import time
from datetime import datetime, timezone
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app import database, models, rabbitmq_pub, schemas

app = FastAPI(title="Order Microservice")

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


def _to_order_status(value) -> models.OrderStatus:
    if isinstance(value, models.OrderStatus):
        return value
    try:
        return models.OrderStatus(value)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown order status: {value}",
        )


def _enforce_transition(current, target):
    current_status = _to_order_status(current)
    target_status = _to_order_status(target)
    allowed = ALLOWED_TRANSITIONS.get(current_status, set())
    if target_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Invalid status transition: {current_status.value} -> {target_status.value}",
        )

#api endpoints
@app.on_event("startup")
def startup_event():
    # Retry connecting to database with exponential backoff
    max_retries = 10
    retry_count = 0
    while retry_count < max_retries:
        try:
            # Test the connection
            with database.engine.connect() as conn:
                pass
            break
        except Exception as err:
            retry_count += 1
            if retry_count >= max_retries:
                print(f"Failed to connect to database after {max_retries} retries: {err}")
                raise
            wait_time = min(2 ** retry_count, 10)  # Exponential backoff, max 10 seconds
            print(f"Database not ready, retrying in {wait_time}s... (attempt {retry_count}/{max_retries})")
            time.sleep(wait_time)
    
    models.Base.metadata.create_all(bind=database.engine)


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
            order_description=order_request.order_description,
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
    client_id: Optional[int] = None,
    freelancer_id: Optional[int] = None,
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


@app.patch("/orders/{order_id}/payment-release-result", response_model=schemas.OrderResponse)
def apply_payment_release_result(
    order_id: int,
    request: schemas.PaymentReleaseResultRequest,
    db: Session = Depends(database.get_db),
):
    order = _get_order_or_404(db, order_id)
    if request.payment_status != schemas.PaymentReleaseStatus.RELEASED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="payment_status must be released")

    current_status = _to_order_status(order.status)
    if current_status == models.OrderStatus.DELIVERED:
        _enforce_transition(order.status, models.OrderStatus.COMPLETED)
        order.status = models.OrderStatus.COMPLETED
    elif current_status != models.OrderStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot apply payment release for order status: {current_status.value}",
        )

    order.payment_transaction_id = str(request.payment_id)
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


@app.patch("/orders/{order_id}/payment-result", response_model=schemas.OrderResponse)
def apply_payment_result(
    order_id: int,
    request: schemas.PaymentResultRequest,
    db: Session = Depends(database.get_db),
):
    order = _get_order_or_404(db, order_id)
    target_status = (
        models.OrderStatus.IN_PROGRESS
        if request.payment_status == schemas.PaymentResultStatus.HELD
        else models.OrderStatus.PAYMENT_FAILED
    )
    _enforce_transition(order.status, target_status)
    order.status = target_status
    order.payment_transaction_id = str(request.payment_id)
    db.commit()
    db.refresh(order)
    try:
        rabbitmq_pub.publish_order_status_updated_event(order)
        if target_status == models.OrderStatus.IN_PROGRESS:
            rabbitmq_pub.publish_order_confirmed_event(order)
    except Exception as err:
        print(f"Failed to publish to RabbitMQ: {err}")
    return order
