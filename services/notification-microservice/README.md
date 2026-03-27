# Notification Microservice

Atomic microservice responsible for delivering in-app notifications to users based on order lifecycle events.

## Responsibilities
- Consumes order events from RabbitMQ (`order_events` exchange)
- Creates notifications for the relevant user on each event
- Exposes endpoints to fetch notifications per user

## Tech Stack
- **Language**: Python 3.11
- **Framework**: FastAPI
- **Database**: MySQL 8.4 (via SQLAlchemy ORM)
- **Messaging**: RabbitMQ (pika)
- **Container**: Docker

---

## API Endpoints

| Method | Endpoint                   | Description                      |
|--------|----------------------------|----------------------------------|
| GET    | `/health`                  | Health check                     |
| GET    | `/notifications/{user_id}` | Get all notifications for a user |

---

## Event Integration

### Subscribes
| Event            | Exchange       | Who Gets Notified |
|------------------|----------------|-------------------|
| `OrderCreated`   | `order_events` | Freelancer        |
| `OrderDelivered` | `order_events` | Client            |
| `OrderDisputed`  | `order_events` | Freelancer        |
| `OrderCancelled` | `order_events` | Freelancer        |

> This service only **consumes** from RabbitMQ — it does not publish any events.
> Processed event IDs are tracked in `processed_events` for idempotency (same as Order Microservice pattern).

---

## Running Tests

### Step 1 — Create and activate virtual environment
```bash
python -m venv venv
venv\Scripts\activate
```

### Step 2 — Install dependencies
```bash
pip install -r requirements.txt
```

### Step 3 — Run tests
```bash
pytest tests/ -v
```

Expected output: 11 tests passing

> Tests use SQLite and do not require MySQL, Docker, or RabbitMQ.

---

## Docker Compose Snippet (for teammates)

This service does not have its own `docker-compose.yml` — it will be part of the team's shared `infra/docker-compose.yml`.

Paste the following blocks into `infra/docker-compose.yml` under the `services:` key:

```yaml
notification-microservice:
    build:
      context: ../services/notification-microservice
      dockerfile: Dockerfile
    container_name: notification-microservice
    restart: on-failure
    depends_on:
      notification-db:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    environment:
      DATABASE_URL: mysql+pymysql://notification_user:notification_pass@notification-db:3306/notification_db
      RABBITMQ_HOST: rabbitmq
    ports:
      - "8005:8000"
    networks:
      - ms-net

  notification-db:
    image: mysql:8.4
    container_name: notification-db
    environment:
      MYSQL_DATABASE: notification_db
      MYSQL_USER: notification_user
      MYSQL_PASSWORD: notification_pass
      MYSQL_ROOT_PASSWORD: root_pass
    ports:
      - "3311:3306"
    volumes:
      - notification_db_data:/var/lib/mysql
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h localhost -uroot -proot_pass || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 10
    networks:
      - ms-net
```

> `rabbitmq` refers to the shared RabbitMQ service already defined in `infra/docker-compose.yml` by the Order Microservice team.

---

## Environment Variables

| Variable        | Default                                                            | Description                  |
|-----------------|--------------------------------------------------------------------|------------------------------|
| `DATABASE_URL`  | `mysql+pymysql://root:rootpassword@localhost:3306/notification_db` | SQLAlchemy DB connection URL |
| `RABBITMQ_HOST` | `localhost`                                                        | RabbitMQ hostname            |

---

## Notes for Teammates

- Do not access `notification_db` directly from other services. Use the HTTP API instead.
- `user_id` in notifications corresponds to either `client_id` or `freelancer_id` from the original order event, depending on the event type.
- State is append-only — notifications are never deleted, only created.