# services/chat_microservice/app/rabbitmq_consumer.py
import os
import json
import asyncio
import aio_pika

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
QUEUE_NAME = "OrderCreated"

async def consume_order_created():
    while True:
        try:
            connection = await aio_pika.connect_robust(RABBITMQ_URL)
            channel = await connection.channel()
            queue = await channel.declare_queue(QUEUE_NAME, durable=True)

            print(f"✅ Connected to RabbitMQ, waiting for messages in {QUEUE_NAME}")

            async with queue.iterator() as queue_iter:
                async for message in queue_iter:
                    async with message.process():
                        payload = json.loads(message.body.decode())
                        print(f"RabbitMQ Event Received: Order {payload.get('orderId')} created")
        except Exception as e:
            print(f"❌ RabbitMQ connection failed: {e}")
            await asyncio.sleep(5)