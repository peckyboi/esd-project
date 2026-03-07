import json
import os
from datetime import datetime, timezone
from uuid import uuid4

import pika


def _base_order_data(order):
    return {
        "order_id": order.id,
        "client_id": order.client_id,
        "freelancer_id": order.freelancer_id,
        "gig_id": order.gig_id,
        "amount": order.price,
        "status": order.status,
        "payment_transaction_id": order.payment_transaction_id,
        "dispute_reason": order.dispute_reason,
        "settlement_amount": order.settlement_amount,
    }

#to publish order data, plus whatever data we need to send over
def _publish_event(event_type, data):
    event_id = str(uuid4())
    event_payload = {
        "event_id": event_id,
        "event_type": event_type,
        "emitted_at": datetime.now(timezone.utc).isoformat(),
        "data": data,
    }

    message_body = json.dumps(event_payload)

    rabbitmq_host = os.getenv("RABBITMQ_HOST", "localhost")
    connection_params = pika.ConnectionParameters(host=rabbitmq_host)
    connection = pika.BlockingConnection(connection_params)
    channel = connection.channel()

    exchange_name = "order_events"
    channel.exchange_declare(exchange=exchange_name, exchange_type="fanout", durable=True)
    channel.basic_publish(
        exchange=exchange_name,
        routing_key="",
        body=message_body,
        properties=pika.BasicProperties(
            message_id=event_id,
            content_type="application/json",
            delivery_mode=pika.spec.PERSISTENT_DELIVERY_MODE,
        ),
    )
    connection.close()
    return event_id


def publish_order_created_event(order):
    event_id = _publish_event(
        "OrderCreated",
        {
            **_base_order_data(order),
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    )
    print(f"Sent 'OrderCreated' event for Order ID: {order.id}, event_id: {event_id}")


def publish_order_delivered_event(order):
    event_id = _publish_event("OrderDelivered", _base_order_data(order))
    print(f"Sent 'OrderDelivered' event for Order ID: {order.id}, event_id: {event_id}")


def publish_order_completed_event(order):
    event_id = _publish_event("OrderCompleted", _base_order_data(order))
    print(f"Sent 'OrderCompleted' event for Order ID: {order.id}, event_id: {event_id}")


def publish_order_disputed_event(order):
    event_id = _publish_event("OrderDisputed", _base_order_data(order))
    print(f"Sent 'OrderDisputed' event for Order ID: {order.id}, event_id: {event_id}")


def publish_order_cancelled_event(order):
    event_id = _publish_event("OrderCancelled", _base_order_data(order))
    print(f"Sent 'OrderCancelled' event for Order ID: {order.id}, event_id: {event_id}")


def publish_order_status_updated_event(order):
    event_id = _publish_event("OrderStatusUpdated", _base_order_data(order))
    print(f"Sent 'OrderStatusUpdated' event for Order ID: {order.id}, event_id: {event_id}")
