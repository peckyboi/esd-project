# 📦 Enterprise Microservices Project

## 🏗 Project Structure

This project follows a **monorepo architecture**, where all microservices, frontend, and infrastructure configurations are maintained in a single repository.

```
project-root/
│
├── frontend/                  # React frontend application
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── .env.example
│
├── services/                  # All backend microservices
│   │
│   ├── booking-service/       # Example microservice
│   │   ├── app/               # Main application code
│   │   │   ├── main.py        # Service entry point
│   │   │   ├── routes/        # API route definitions
│   │   │   ├── models/        # Data models
│   │   │   ├── schemas/       # DTOs / validation schemas
│   │   │   ├── services/      # Business logic
│   │   │   └── db/            # Database connection logic
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── tests/
│   │
│   ├── payment-service/
│   ├── notification-service/
│   └── ...
│
├── infra/
│   ├── docker-compose.yml     # Multi-container orchestration
│   └── .env.example
│
├── docs/
│   ├── diagrams/              # Architecture diagrams
│   ├── api-specs/             # OpenAPI / Postman collections
│   └── event-contracts/       # RabbitMQ message schemas
│
├── scripts/                   # Utility scripts (seeding, etc.)
│
├── .gitignore
└── README.md
```

---

# 👨‍💻 Where to Place Your Files

## 🔹 Frontend Developers

All UI-related work goes inside:

```
frontend/
```

* Pages → `frontend/src/pages/`
* Components → `frontend/src/components/`
* API calls → `frontend/src/services/`
* Environment variables → `.env` (do NOT commit secrets)

---

## 🔹 Backend Developers (Microservices)

Each microservice has its own isolated folder inside:

```
services/<your-service-name>/
```

Inside your service:

* API routes → `app/routes/`
* Business logic → `app/services/`
* Database models → `app/models/`
* DB connection config → `app/db/`
* Entry point → `app/main.py`
* Dependencies → `requirements.txt`
* Container config → `Dockerfile`

⚠️ Each microservice must:

* Have its **own database**
* Not directly access another service’s database
* Communicate via HTTP or message broker (e.g., RabbitMQ)

---

## 🔹 Infrastructure / DevOps

All container orchestration is managed in:

```
infra/docker-compose.yml
```

If you add:

* A new microservice
* A new database
* RabbitMQ
* API Gateway

You must update `docker-compose.yml`.

---

# 🐳 Running the Project

From the root directory:

```bash
cd infra
docker compose up --build
```

Frontend will typically run on:

```
http://localhost:3000
```

Microservices run on assigned ports (see docker-compose.yml).

---

# 🔐 Important Rules

### ✅ Commit:

* Dockerfiles
* docker-compose.yml
* requirements.txt
* package.json
* Source code

### ❌ Do NOT commit:

* `.env`
* API keys
* `node_modules/`
* `__pycache__/`
* Built Docker images

---

# 🧠 Development Guidelines

* Each microservice must be **independently deployable**
* No shared databases between services
* Use HTTP for synchronous communication
* Use RabbitMQ (or message broker) for async communication
* JSON must be used in APIs and messaging
* At least one service should be reusable across scenarios

---

# 📄 Documentation

All diagrams and API documentation should be placed in:

```
docs/
```

Include:

* Architecture diagram
* Service interaction diagrams
* API documentation
* Event flow diagrams

---

# 👥 Team Contribution

Each member should primarily work within:

* Their assigned microservice folder
* Or frontend folder
* Or infrastructure folder

Avoid modifying another member’s service unless coordinated.

---

