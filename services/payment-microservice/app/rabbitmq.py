import os
import json
import pika
import uuid


RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")


def get_connection():
    params = pika.ConnectionParameters(host=RABBITMQ_HOST)
    return pika.BlockingConnection(params)


def publish_event(exchange: str, event_type: str, data: dict):
    """
    Publish an event to a RabbitMQ fanout exchange.
    """
    try:
        connection = get_connection()
        channel = connection.channel()
        channel.exchange_declare(exchange=exchange, exchange_type="fanout", durable=True)

        message = {
            "event_type": event_type,
            "event_id": str(uuid.uuid4()),
            "data": data
        }

        channel.basic_publish(
            exchange=exchange,
            routing_key="",
            body=json.dumps(message),
            properties=pika.BasicProperties(delivery_mode=2)  # Persistent
        )

        connection.close()
        print(f"Published event '{event_type}' to exchange '{exchange}'")
    except Exception as e:
        print(f"Failed to publish event '{event_type}': {e}")


def publish_payment_success(order_id: int, payment_id: int, amount: float):
    publish_event(
        exchange="payment_events",
        event_type="PaymentSuccess",
        data={
            "order_id": order_id,
            "payment_id": payment_id,
            "amount": amount
        }
    )


def publish_payment_failed(order_id: int, payment_id: int, reason: str):
    publish_event(
        exchange="payment_events",
        event_type="PaymentFailed",
        data={
            "order_id": order_id,
            "payment_id": payment_id,
            "reason": reason
        }
    )


def publish_payment_completed(order_id: int, payment_id: int, status: str):
    publish_event(
        exchange="payment_events",
        event_type="payment.completed",
        data={
            "order_id": order_id,
            "payment_id": payment_id,
            "status": status  # "released" or "refunded"
        }
    )
