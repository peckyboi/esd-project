# Review Microservice (Spring Boot) with Docker Compose

This guide shows how to run `review-microservice` together with your existing Python Flask microservices in one Docker Compose network.

## What Docker Compose Does
Docker Compose starts multiple containers together as one app stack.

For this service, Compose runs:
- `review-microservice` (Spring Boot API)
- `review-db` (MySQL database)
- `review-db-seeder` (one-off seed job for dummy reviews)

Why this matters:
- The review service needs MySQL at startup.
- `docker build` only builds an image; it does not run dependencies like MySQL.
- Compose wires networking, environment variables, startup order, and volumes for you.
- Seeder runs automatically so you get dummy data after `up`.

## What You Need

- Docker Desktop installed and running
- A shared `docker-compose.yml` (usually in `infra/` or repo root)
- Unique port mapping for this service (default: `8085`)

## 1) Add Services to Docker Compose (for later when our services run together)

Add these blocks to your shared `docker-compose.yml`:

```yaml
services:
  review-db:
    image: mysql:8.4
    container_name: review-db
    environment:
      MYSQL_DATABASE: review_db
      MYSQL_USER: review_user
      MYSQL_PASSWORD: review_pass
      MYSQL_ROOT_PASSWORD: root_pass
    ports:
      - "3307:3306"
    volumes:
      - review_db_data:/var/lib/mysql
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h localhost -uroot -proot_pass || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 10
    networks:
      - ms-net

  review-microservice:
    build:
      context: ./services/review-microservice
      dockerfile: Dockerfile
    container_name: review-microservice
    depends_on:
      review-db:
        condition: service_healthy
    environment:
      SERVER_PORT: 8085
      SPRING_DATASOURCE_URL: jdbc:mysql://review-db:3306/review_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
      SPRING_DATASOURCE_USERNAME: review_user
      SPRING_DATASOURCE_PASSWORD: review_pass
      SPRING_JPA_HIBERNATE_DDL_AUTO: update
      SPRING_RABBITMQ_HOST: rabbitmq
      SPRING_RABBITMQ_PORT: 5672
      SPRING_RABBITMQ_USERNAME: guest
      SPRING_RABBITMQ_PASSWORD: guest
    ports:
      - "8085:8085"
    networks:
      - ms-net

volumes:
  review_db_data:

networks:
  ms-net:
    driver: bridge
```

## 2) How Flask Services Should Call Review Service

Inside Compose network, call by service name:

- Base URL: `http://review-microservice:8085`
- Example: `http://review-microservice:8085/reviews`

Do not use `localhost` between containers.

## 3) Run Everything

From the folder containing `docker-compose.yml`:

```bash
docker compose up --build
```

If you want to test just this service quickly using the local compose file:

```bash
cd services/review-microservice
docker compose up --build
```

To stop:

```bash
docker compose down
```

Run in background:

```bash
cd services/review-microservice
docker compose up --build -d
```

## 4) Verify

- Review service health: `http://localhost:8085/actuator/health`
- Swagger UI: `http://localhost:8085/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8085/v3/api-docs`

## 5) Grand Scheme (When To Use Which Compose)

Use this local compose file in `services/review-microservice/` when:
- You only want to test review service in isolation
- You want fast debugging before opening a PR

Use the top-level/shared project compose when:
- You run the full platform (all microservices together)
- You want real inter-service calls from Flask services to review service

Important:
- In both cases, MySQL must be started together with review service (or already running and reachable).
- If MySQL is not up, review service fails to start due to datasource connection errors.

## 6) Seed Data

Seed files path:
- `services/review-microservice/scripts/schema.sql`
- `services/review-microservice/scripts/seed.sql`

How seeding works now:
- Schema + seed are automatic via `review-db-seeder` during `docker compose up`.
- Seed script is idempotent (`ON DUPLICATE KEY UPDATE`), so reruns are safe.

Manually re-run seed:

```bash
cd services/review-microservice
docker compose exec -T review-db mysql -ureview_user -preview_pass review_db < scripts/schema.sql
docker compose exec -T review-db mysql -ureview_user -preview_pass review_db < scripts/seed.sql
```

Run seed against local MySQL (non-docker, if needed):

```bash
cd services/review-microservice
mysql -h 127.0.0.1 -P 3306 -ureview_user -preview_pass review_db < scripts/seed.sql
```

Quick check:

```bash
cd services/review-microservice
docker compose exec review-db mysql -ureview_user -preview_pass -e "SELECT order_id, client_id, rating FROM review_db.reviews;"
```

Remove seeded data only (keep schema):

```bash
cd services/review-microservice
docker compose exec review-db mysql -ureview_user -preview_pass -e "DELETE FROM review_db.reviews WHERE order_id IN (1001,1002,1003,1004,1005);"
```

Reset everything including database files:

```bash
cd services/review-microservice
docker compose down -v
```
