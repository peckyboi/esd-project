# Freelance Gig Service (Microservices Monorepo)

A full-stack microservices project for a freelance marketplace workflow:
- Browse gigs and place orders
- Manage order lifecycle (deliver, approve, dispute, settle)
- Real-time dispute chat (WebSocket)
- Asynchronous notifications via RabbitMQ events

## Repository Structure

```text
freelance_service/
├── frontend/                     # React + Vite UI
├── infra/                        # Docker Compose, infra config, seed container
├── services/
│   ├── order_microservice/
│   ├── payment-microservice/
│   ├── review-microservice/
│   ├── freelance-job-service/
│   ├── browse-gig-composite/
│   ├── chat-microservice-2/
│   ├── dispute-composite/
│   └── notification-microservice/
└── README.md
```

## Architecture Overview

### Core Services
- `freelance-job-service`: gig listings and gig filtering/search.
- `order-microservice`: order lifecycle and order status transitions.
- `payment-microservice`: payment hold/release/refund and Stripe integration.
- `review-microservice`: reviews and review eligibility flow.
- `notification-microservice`: stores user notifications; consumes domain events from RabbitMQ.
- `chat-microservice-2`: dispute chat rooms/messages with WebSocket + REST history.

### Composite Services
- `browse-gig-composite`: aggregates gig, freelancer, and review data for browse/detail pages.
- `dispute-composite`: orchestrates dispute start + settlement operations across order/payment/chat.

### Messaging and Realtime
- RabbitMQ is used for async domain events (`order_events`, `payment_events`).
- Notifications are currently updated in UI using polling every 5 seconds.
- Dispute chat uses WebSocket for live message exchange.

## Service Ports

| Service | Port |
|---|---:|
| Frontend (Vite) | `5173` |
| RabbitMQ AMQP | `5672` |
| RabbitMQ UI | `15672` |
| Order Microservice | `8000` |
| Payment Microservice | `8002` |
| Freelance Job Service | `8084` |
| Review Microservice | `8085` |
| Browse Gig Composite | `8087` |
| Notification Microservice | `8005` |
| Chat Microservice v2 | `8090` |
| Dispute Composite | `8091` |

## Key Flows

### 1) Browse and Order
1. UI calls `browse-gig-composite` for gig catalog/details.
2. Composite fetches gigs from `freelance-job-service`, reviews from `review-microservice`, and user profile data on Outsystems.
3. User places order; order lifecycle is managed by `order-microservice`.

### 2) Deliver and Approve
1. Freelancer marks order delivered.
2. Client approves order.
3. Payment is released via `payment-microservice`.
4. Order status is finalized by `order-microservice`.
5. Services emit events consumed by `notification-microservice`.

### 3) Dispute and Settlement
1. Client/freelancer starts dispute via `dispute-composite`.
2. Composite marks order disputed and creates/gets dispute chat in `chat-microservice-2`.
3. Both parties chat over WebSocket.
4. One party proposes settlement (`REFUND` or `RELEASE`), counterparty accepts/rejects.
5. On acceptance, composite orchestrates payment update + order settlement and closes dispute chat.

### 4) Notifications
1. Core services publish events to RabbitMQ.
2. `notification-microservice` consumes events and stores notifications.
3. Frontend polls notifications endpoint every 5 seconds to refresh badge/list.

## Environment Variables (Need to create before running)

### Root / Infra
- `infra/.env`:
- `STRIPE_SECRET_KEY` is required by `payment-microservice`.

### Frontend
- `frontend/.env` supports:
- `VITE_API_BASE_URL`
- `VITE_ORDER_API_BASE_URL`
- `VITE_DISPUTE_COMPOSITE_API_BASE_URL`
- `VITE_NOTIFICATION_API_BASE_URL`

Current defaults in code/compose target local ports.

## Running the Project

### Prerequisites
- Docker Desktop (or Docker Engine + Compose)
- Node.js 18+ (only needed if you run frontend outside Docker)

### Run Everything with Docker Compose

```bash
cd infra
docker compose up --build
```

Open:
- Frontend: [http://localhost:5173](http://localhost:5173)
- RabbitMQ Management: [http://localhost:15672](http://localhost:15672)


## Testing and Health Checks

### Quick health checks
- Order: `GET http://localhost:8000/health`
- Payment: `GET http://localhost:8002/health`
- Review: `GET http://localhost:8085/actuator/health` (Spring Boot)
- Freelance jobs: `GET http://localhost:8084/health`
- Notification: `GET http://localhost:8005/health`
- Chat: `GET http://localhost:8090/health`
- Dispute composite: `GET http://localhost:8091/health`

### Running service-level tests
Run tests from each service folder (where provided in that service).

## Important Design Rules

- Each microservice owns its own database.
- No cross-service direct DB reads/writes.
- Sync communication uses HTTP APIs.
- Async propagation uses RabbitMQ events.
- Composite services orchestrate workflows but do not replace core service ownership.

## Troubleshooting

### Notification badge not updating
- Confirm `notification-microservice` is healthy.
- Confirm polling request is hitting `GET /notifications/{user_id}`.
- Ensure `Acting As` user ID matches intended recipient.

### Chat not syncing
- Confirm chat WebSocket connects to `ws://localhost:8090/ws/chats/{chat_id}`.
- Confirm both tabs are in the same `chat_id`.

### Containers start before DB is ready
- Most services already include retry/wait logic.
- If needed, restart stack after DB health checks pass:
```bash
docker compose -f infra/docker-compose.yml down
docker compose -f infra/docker-compose.yml up --build
```

