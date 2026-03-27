import json
import os
import threading

import pika

from app.database import SessionLocal
from app import models


def _already_processed(db, event_id: str) -> bool:
    return (
        db.query(models.ProcessedEvent)
        .filter(models.ProcessedEvent.event_id == event_id)
        .first()
        is not None
    )


def _mark_processed(db, event_id: str, event_type: str):
    db.add(models.ProcessedEvent(event_id=event_id, event_type=event_type))


def _create_notification(db, user_id: int, order_id: int, message: str):
    db.add(models.Notification(user_id=user_id, order_id=order_id, message=message))


def _handle_order_created(db, data: dict):
    freelancer_id = data.get("freelancer_id")
    order_id = data.get("order_id")
    if not freelancer_id or not order_id:
        return
    _create_notification(
        db,
        user_id=freelancer_id,
        order_id=order_id,
        message=f"You have received a new order (Order #{order_id}).",
    )


def _handle_order_delivered(db, data: dict):
    client_id = data.get("client_id")
    order_id = data.get("order_id")
    if not client_id or not order_id:
        return
    _create_notification(
        db,
        user_id=client_id,
        order_id=order_id,
        message=f"Your order (Order #{order_id}) has been delivered. Please review and approve.",
    )


def _handle_order_disputed(db, data: dict):
    freelancer_id = data.get("freelancer_id")
    order_id = data.get("order_id")
    if not freelancer_id or not order_id:
        return
    _create_notification(
        db,
        user_id=freelancer_id,
        order_id=order_id,
        message=f"Order #{order_id} has been disputed by the client.",
    )


def _handle_order_cancelled(db, data: dict):
    freelancer_id = data.get("freelancer_id")
    order_id = data.get("order_id")
    if not freelancer_id or not order_id:
        return
    _create_notification(
        db,
        user_id=freelancer_id,
        order_id=order_id,
        message=f"Order #{order_id} has been cancelled.",
    )


EVENT_HANDLERS = {
    "OrderCreated": _handle_order_created,
    "OrderDelivered": _handle_order_delivered,
    "OrderDisputed": _handle_order_disputed,
    "OrderCancelled": _handle_order_cancelled,
}


def _process_message(body: bytes, message_id: str):
    payload = json.loads(body)
    event_type = payload.get("event_type")
    event_id = payload.get("event_id") or message_id
    data = payload.get("data", {})

    if not event_type or event_type not in EVENT_HANDLERS:
        return

    db = SessionLocal()
    try:
        if event_id and _already_processed(db, event_id):
            return

        EVENT_HANDLERS[event_type](db, data)

        if event_id:
            _mark_processed(db, event_id, event_type)

        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def _consumer_loop():
    rabbitmq_host = os.getenv("RABBITMQ_HOST", "localhost")
    params = pika.ConnectionParameters(host=rabbitmq_host)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    channel.exchange_declare(exchange="order_events", exchange_type="fanout", durable=True)

    queue_name = "notification_service_events"
    channel.queue_declare(queue=queue_name, durable=True)
    channel.queue_bind(exchange="order_events", queue=queue_name)

    def callback(ch, method, properties, body):
        try:
            _process_message(body, properties.message_id)
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as err:
            print(f"Error processing message: {err}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=queue_name, on_message_callback=callback)
    print("Notification service consumer started. Waiting for order events...")
    channel.start_consuming()


def start_consumer_in_background():
    thread = threading.Thread(target=_consumer_loop, daemon=True)
    thread.start()
