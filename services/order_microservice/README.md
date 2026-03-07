# Order Microservice

Atomic microservice responsible for managing the order lifecycle for freelance gigs.

## Responsibilities
- Create and store orders
- Track lifecycle status transitions (`pending_payment` -> `in_progress` -> `delivered` -> `completed`)
- Handle dispute flow (`disputed` -> `refunded` or `released`)
- Publish domain events for other services (notification, payment, review, etc.)
- Consume payment/dispute resolution events from RabbitMQ

## Tech Stack
- **Language**: Python 3.11
- **Framework**: FastAPI
- **Database**: MySQL 8.0 (SQLAlchemy ORM)
- **Messaging**: RabbitMQ (pika)
- **Container**: Docker

---

## API Endpoints

| Method | Endpoint                     | Description |
|--------|------------------------------|-------------|
| GET    | `/health`                    | Health check |
| POST   | `/orders`                    | Create a new order |
| GET    | `/orders`                    | List orders with optional filters |
| GET    | `/orders/{order_id}`         | Get a single order |
| PATCH  | `/orders/{order_id}/cancel`  | Soft-cancel order |
| PATCH  | `/orders/{order_id}/deliver` | Mark order as delivered |
| PATCH  | `/orders/{order_id}/approve` | Mark delivered order as completed |
| PATCH  | `/orders/{order_id}/dispute` | Raise dispute on delivered order |
| PATCH  | `/orders/{order_id}/settle`  | Resolve dispute (`refunded`/`released`) |

### Query Parameters for `GET /orders`

| Param           | Type   | Description |
|-----------------|--------|-------------|
| `client_id`     | string | Filter by client |
| `freelancer_id` | string | Filter by freelancer |
| `status_filter` | string | Filter by order status |

---

## Order Statuses

- `pending_payment`
- `in_progress`
- `delivered`
- `completed`
- `disputed`
- `refunded`
- `released`
- `payment_failed`
- `cancelled`

---

## Event Integration

### Publishes
- `OrderCreated`
- `OrderDelivered`
- `OrderCompleted`
- `OrderDisputed`
- `OrderCancelled`
- `OrderStatusUpdated`

### Subscribes
- `PaymentSuccess` (moves order to `in_progress`)
- `PaymentFailed` (moves order to `payment_failed`)
- `DisputeResolved` (moves order to `refunded` or `released`)

> Notes:
> - Event messages include an `event_id`.
> - Processed event IDs are tracked in `processed_events` for idempotency.

---

## Running Locally (Docker only)

From `order_microservice/`:

```bash
docker build -t order-microservice .
docker run --rm -p 8000:8000 order-microservice
```

Open Swagger at: `http://localhost:8000/docs`

> If you need MySQL and RabbitMQ together locally, run them through the team-level `infra/docker-compose.yml`.

---

## Environment Variables

| Variable        | Default                                                | Description |
|----------------|--------------------------------------------------------|-------------|
| `DATABASE_URL` | `mysql+pymysql://root:rootpassword@localhost:3306/orders_db` | SQLAlchemy DB connection URL |
| `RABBITMQ_HOST`| `localhost`                                            | RabbitMQ host |

---

## Running Tests

From project root:

```bash
source venv/bin/activate
pip install -r services/order_microservice/requirements.txt
pytest services/order_microservice/tests -v
```

Run specific modules:
From order_microservice

```bash
pytest ./tests/test_order_transitions.py -v
pytest ./tests/test_orders_crud.py -v
```

### Test Structure

- `tests/conftest.py`: shared fixtures (SQLite test DB, dependency override, TestClient, DB reset, RabbitMQ publisher mocks)
- `tests/test_health.py`: health endpoint checks
- `tests/test_orders_crud.py`: create/get basic order behavior
- `tests/test_order_filters.py`: list/filter endpoint behavior
- `tests/test_order_transitions.py`: lifecycle transition rules and status updates
- `tests/test_order_validation.py`: request validation (422 cases)

> Notes:
> - Tests use SQLite (`test_order.db`) and do not require MySQL/RabbitMQ.
> - RabbitMQ publish calls are mocked and asserted.

---

## Notes for Teammates

- Do not access `orders_db` directly from other services. Use HTTP APIs or RabbitMQ events.
- This service stores only order-domain data and references external entities by ID (`client_id`, `freelancer_id`, `gig_id`).
- State transitions are guarded; invalid transitions return HTTP `409`.
