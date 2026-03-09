import json
import os
import threading
from datetime import datetime

import pika
from sqlalchemy.orm import Session

from app import models, rabbitmq_pub
from app.database import SessionLocal

ALLOWED_TRANSITIONS = {
    models.OrderStatus.PENDING_PAYMENT: {
        models.OrderStatus.IN_PROGRESS,
        models.OrderStatus.PAYMENT_FAILED,
    },
    models.OrderStatus.IN_PROGRESS: {models.OrderStatus.DELIVERED},
    models.OrderStatus.DELIVERED: {models.OrderStatus.COMPLETED, models.OrderStatus.DISPUTED},
    models.OrderStatus.DISPUTED: {models.OrderStatus.REFUNDED, models.OrderStatus.RELEASED},
}


def _is_valid_transition(current_status, target_status):
    allowed = ALLOWED_TRANSITIONS.get(current_status, set())
    return target_status in allowed


def _mark_processed(db: Session, event_id: str, event_type: str):
    db.add(models.ProcessedEvent(event_id=event_id, event_type=event_type))


def _already_processed(db: Session, event_id: str):
    return (
        db.query(models.ProcessedEvent)
        .filter(models.ProcessedEvent.event_id == event_id)
        .first()
        is not None
    )


def _handle_payment_success(db: Session, order, data):
    if not _is_valid_transition(order.status, models.OrderStatus.IN_PROGRESS):
        return

    order.status = models.OrderStatus.IN_PROGRESS
    order.payment_transaction_id = data.get("payment_transaction_id") or data.get("transaction_id")
    db.commit()
    db.refresh(order)
    rabbitmq_pub.publish_order_status_updated_event(order)


def _handle_payment_failed(db: Session, order):
    if not _is_valid_transition(order.status, models.OrderStatus.PAYMENT_FAILED):
        return

    order.status = models.OrderStatus.PAYMENT_FAILED
    db.commit()
    db.refresh(order)
    rabbitmq_pub.publish_order_status_updated_event(order)


def _handle_dispute_resolved(db: Session, order, data):
    resolution = str(data.get("resolution", "")).lower()
    final_status = data.get("final_status")

    if final_status:
        try:
            target = models.OrderStatus(final_status)
        except ValueError:
            return
    elif resolution in {"refund", "refunded"}:
        target = models.OrderStatus.REFUNDED
    elif resolution in {"release", "released"}:
        target = models.OrderStatus.RELEASED
    else:
        return

    if not _is_valid_transition(order.status, target):
        return

    order.status = target
    order.settlement_amount = data.get("settlement_amount", order.settlement_amount)
    resolved_at = data.get("resolved_at")
    if resolved_at:
        try:
            order.resolved_at = datetime.fromisoformat(resolved_at.replace("Z", "+00:00"))
        except ValueError:
            pass
    db.commit()
    db.refresh(order)
    rabbitmq_pub.publish_order_status_updated_event(order)


def _process_message(body, message_id):
    payload = json.loads(body)
    event_type = payload.get("event_type")
    event_id = payload.get("event_id") or message_id
    data = payload.get("data", {})
    order_id = data.get("order_id")

    if not order_id or not event_type:
        return

    db = SessionLocal()
    try:
        if event_id and _already_processed(db, event_id):
            return

        order = db.query(models.Order).filter(models.Order.id == order_id).first()
        if not order:
            return

        if event_type == "PaymentSuccess":
            _handle_payment_success(db, order, data)
        elif event_type == "PaymentFailed":
            _handle_payment_failed(db, order)
        elif event_type == "DisputeResolved":
            _handle_dispute_resolved(db, order, data)
        else:
            return

        if event_id:
            _mark_processed(db, event_id, event_type)
            db.commit()
    finally:
        db.close()


def _consumer_loop():
    rabbitmq_host = os.getenv("RABBITMQ_HOST", "localhost")
    params = pika.ConnectionParameters(host=rabbitmq_host)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    channel.exchange_declare(exchange="payment_events", exchange_type="fanout", durable=True)
    channel.exchange_declare(exchange="dispute_events", exchange_type="fanout", durable=True)

    queue_name = "order_service_events"
    channel.queue_declare(queue=queue_name, durable=True)
    channel.queue_bind(exchange="payment_events", queue=queue_name)
    channel.queue_bind(exchange="dispute_events", queue=queue_name)

    def callback(ch, method, properties, body):
        try:
            _process_message(body, properties.message_id)
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as err:
            print(f"Error processing message: {err}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=queue_name, on_message_callback=callback)
    print("Order service consumer started. Waiting for payment/dispute events...")
    channel.start_consuming()


def start_consumer_in_background():
    thread = threading.Thread(target=_consumer_loop, daemon=True)
    thread.start()
