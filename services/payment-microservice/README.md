# Payment Microservice

Atomic microservice responsible for handling payment escrow, release and refund via Stripe.

## Responsibilities
- Hold client payment in escrow via Stripe PaymentIntent (capture_method=manual)
- Release payment to freelancer after order completion
- Refund payment to client after dispute resolution
- Publish RabbitMQ events for payment outcomes

## Tech Stack
- **Language**: Python 3.11
- **Framework**: FastAPI
- **Database**: MySQL 8.0 (SQLAlchemy ORM)
- **Payments**: Stripe (test mode only)
- **Messaging**: RabbitMQ (pika)
- **Container**: Docker

---

## API Endpoints

| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| GET    | `/health`                 | Health check                       |
| POST   | `/payments/hold`          | Hold payment in escrow via Stripe  |
| PATCH   | `/payments/release`       | Release payment to freelancer      |
| PATCH   | `/payments/refund`        | Refund payment to client           |
| GET    | `/payments/{payment_id}`  | Get payment details                |

---

## Payment Statuses

- `held` — payment held in escrow via Stripe
- `released` — payment captured and released to freelancer
- `refunded` — payment refunded back to client
- `failed` — Stripe payment failed

---

## Event Integration

### Publishes
- `PaymentSuccess` → payment_events exchange (after successful hold)
- `PaymentFailed` → payment_events exchange (after failed hold)
- `paymentReleased` → payment_events exchange (after successful release)
- `paymentRefunded` → payment_events exchange (after successful refund)

### Event Payload Format
```json
{
  "event_type": "PaymentSuccess",
  "event_id": "uuid",
  "data": {
    "order_id": 1001,
    "payment_id": 1,
    "amount": 50.0
  }
}
```

---

## Stripe Integration

This service uses Stripe in **test mode only**.

- Uses hardcoded test payment method `pm_card_visa`
- No real card details stored
- `capture_method=manual` holds payment in escrow
- `capture` releases the held payment
- `refund` returns payment to client

To use a real Stripe test key, set the environment variable:
```
STRIPE_SECRET_KEY=sk_test_placeholder
```

Get your test key from: https://dashboard.stripe.com/test/apikeys

---

## Running Locally (Docker only)

### Step 1: Build the Docker image

**Mac/Linux:**
```bash
docker build -t payment-microservice .
```

**Windows (Command Prompt or PowerShell):**
```bash
docker build -t payment-microservice .
```

---

### Step 2: Run the container

**Mac/Linux:**
```bash
docker run --rm -p 8002:8002 \
  -e DATABASE_URL="sqlite:////code/payment_dev.db" \
  -e RABBITMQ_HOST="host.docker.internal" \
  -e STRIPE_SECRET_KEY="sk_test_placeholder" \
  payment-microservice
```

**Windows (Command Prompt):**
```bash
docker run --rm -p 8002:8002 -e DATABASE_URL="sqlite:////code/payment_dev.db" -e RABBITMQ_HOST="host.docker.internal" -e STRIPE_SECRET_KEY="sk_test_placeholder" payment-microservice
```

**Windows (PowerShell):**
```powershell
docker run --rm -p 8002:8002 `
  -e DATABASE_URL="sqlite:////code/payment_dev.db" `
  -e RABBITMQ_HOST="host.docker.internal" `
  -e STRIPE_SECRET_KEY="sk_test_your_key_here" `
  payment-microservice
```

---

### Step 3: Open Swagger

```
http://localhost:8002/docs
```

---

### Important Startup Note

The service starts a RabbitMQ consumer thread on startup. If RabbitMQ is not running, you will see a connection error in logs, but the API can still run for basic endpoint testing.

### If You Want RabbitMQ Connected Locally

Start RabbitMQ first:

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

Then run the payment service pointing to host broker (already set via `host.docker.internal` above).

RabbitMQ UI: `http://localhost:15672` (guest / guest)

---

### Run with Full Infra (MySQL + RabbitMQ)

```bash
docker compose up --build
```

---

## Environment Variables

| Variable            | Default                                                      | Description          |
|---------------------|--------------------------------------------------------------|----------------------|
| `ENVIRONMENT`       | `development`                                                | Switch SQLite/MySQL  |
| `DATABASE_URL`      | `mysql+pymysql://root:password123@localhost:3306/payment_db` | DB connection URL    |
| `RABBITMQ_HOST`     | `localhost`                                                  | RabbitMQ host        |
| `STRIPE_SECRET_KEY` | `sk_test_placeholder`                                        | Stripe secret key    |

---

## Running Tests

### Mac/Linux:
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run tests
pytest tests/ -v
```

### Windows (Command Prompt):
```bash
# Create virtual environment outside OneDrive to avoid permission issues
python -m venv payment-venv
payment-venv\Scripts\activate

# Install dependencies (use your actual project path)
pip install -r requirements.txt

# Run tests
pytest tests/ -v
```

### Windows (PowerShell):
```powershell
# Create virtual environment outside OneDrive to avoid permission issues
python -m venv payment-venv
.\payment-venv\Scripts\Activate.ps1

# Install dependencies (use your actual project path)
pip install -r requirements.txt

# Run tests
pytest tests/ -v
```

> Tests use SQLite and mock all Stripe and RabbitMQ calls — no external services needed.

---

## Notes for Teammates

- Do not access `payment_db` directly. Use HTTP endpoints or RabbitMQ events.
- Payment status transitions are guarded — cannot release/refund a non-held payment (returns HTTP 409).
- Stripe is in test mode only — no real money is processed.
- ID formats: order_id starts at 1001, client_id at 201, freelancer_id at 301.
