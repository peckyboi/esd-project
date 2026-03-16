# Review Microservice (Spring Boot) with Docker Compose

This guide shows how to run `review-microservice` together with your existing Python Flask microservices in one Docker Compose network.

## What You Need

- Docker Desktop installed and running
- A `Dockerfile` for this Java service
- A shared `docker-compose.yml` (usually in `infra/` or repo root)
- Unique port mapping for this service (default: `8085`)

## 1) Add a Dockerfile for Review Service

Create `services/review-microservice/Dockerfile`:

```dockerfile
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN ./mvnw -DskipTests clean package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java","-jar","/app/app.jar"]
```

## 2) Add Services to Docker Compose

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

## 3) How Flask Services Should Call Review Service

Inside Compose network, call by service name:

- Base URL: `http://review-microservice:8085`
- Example: `http://review-microservice:8085/reviews`

Do not use `localhost` between containers.

## 4) Run Everything

From the folder containing `docker-compose.yml`:

```bash
docker compose up --build
```

## 5) Verify

- Review service health: `http://localhost:8085/actuator/health`
- Swagger UI: `http://localhost:8085/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8085/v3/api-docs`

