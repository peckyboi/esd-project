# Browse Gig Composite Service (FastAPI) with Docker Compose
Composite microservice responsible for aggregating data from the Freelance Job, Review, and User service, to provide a unifed gig browsing experience.

## API Endpoints
| Method | Endpoint         | Description                              |
|--------|------------------|------------------------------------------|
| GET    | `/health`        | Health check                             |
| GET   | `/browse/gigs`         | Browse Catalog                 |
| GET    | `browse/gigs/{gig_id}`         | Get Specific Gig Details|


## What Docker Compose Does
Docker Compose manages the lifecycle of this composite service and its connectivity to required downstreams.

For this service, Compose handles:
- Service Orchestration: Starts the Python FastAPI application using the provided Dockerfile.
- Networking: Allows the composite service to communicate with freelance-job-service and review-microservice using internal service names.
- Environment Configuration: Injects necessary URLs for downstream microservices.
- Dependency Awareness: The service includes a startup health check that waits for the Job and Review services to be healthy before fully initializing.

## What You Need
- Docker Desktop installed and running.
- A shared docker-compose.yml in your project root.
- Port 8087 (and 8084, 8085) available on your host machine.

# 1) Add Service to Docker Compose
These are all the blocks needed to integrate the composite service. Add them to your main docker-compose if you haven't:

```YAML
services:
  browse-gig-composite:
    build:
      context: ./browse-gig-composite
      dockerfile: Dockerfile
    container_name: browse-gig-composite
    ports:
      - "8087:8087"
    environment:
      - FREELANCE_JOB_SERVICE_URL=http://freelance-job-service:8084
      - REVIEW_SERVICE_URL=http://review-microservice:8085
      - USER_SERVICE_URL=https://personal-43hivjqa.outsystemscloud.com/User/rest/User/
    depends_on:
      freelance-job-service:
        condition: service_healthy
      review-microservice:
        condition: service_healthy
    networks:
      - ms-net

  freelance-job-db:
    image: mysql:8.4
    container_name: freelance-job-db
    environment:
      MYSQL_DATABASE: freelance_job_db
      MYSQL_USER: freelance_job_user
      MYSQL_PASSWORD: freelance_job_pass
      MYSQL_ROOT_PASSWORD: root_pass
    ports:
      - "3310:3306"
    volumes:
      - freelance_job_db_data:/var/lib/mysql
      - ../services/freelance-job-service/scripts:/docker-entrypoint-initdb.d
    healthcheck:
      test:
        [
          "CMD-SHELL",
          "mysqladmin ping -h localhost -uroot -proot_pass || exit 1",
        ]
      interval: 5s
      timeout: 5s
      retries: 20
    networks:
      - ms-net

  freelance-job-service:
    build:
      context: ../services/freelance-job-service
      dockerfile: Dockerfile
    container_name: freelance-job-service
    depends_on:
      freelance-job-db:
        condition: service_healthy
    environment:
      PORT: 8084
      ENVIRONMENT: production
      DB_HOST: freelance-job-db
      DB_PORT: 3306
      DB_USER: freelance_job_user
      DB_PASSWORD: freelance_job_pass
      DB_NAME: freelance_job_db
    ports:
      - "8084:8084"
    networks:
      - ms-net

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
      - ../services/review-microservice/scripts:/docker-entrypoint-initdb.d
    healthcheck:
      test:
        [
          "CMD-SHELL",
          "mysqladmin ping -h localhost -uroot -proot_pass || exit 1",
        ]
      interval: 10s
      timeout: 5s
      retries: 10
    networks:
      - ms-net

  review-microservice:
    build:
      context: ../services/review-microservice
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
  order_db_data:
  payment_db_data:
  freelance_job_db_data:


networks:
  ms-net:
    driver: bridge
```

# 2) How to Call This Service
Once running, you can access the aggregated endpoints:
- Browse All Gigs: GET http://localhost:8087/browse/gigs
- Get Specific Gig: GET http://localhost:8087/browse/gigs/{gig_id}


# 3) Run Everything
From your project root where the docker-compose.yml is located:

```Bash
# Build and start the services
docker compose up --build

# Run in background
docker compose up -d

# Stop the services
docker compose down -v
```

# 4) Verify
- Service Health: http://localhost:8087/health
- Interactive API Docs (Swagger): http://localhost:8087/docs
- Alternative Docs (ReDoc): http://localhost:8087/redoc

# 5) Service Logic & Aggregation
This composite service performs the following "Heavy Lifting" to simplify the frontend:
- Data Enrichment: Fetches base gig data and joins it with User profiles to get freelancer names and avatars.
- Review Summarization: Fetches all reviews for a gig, calculates the average_rating, and counts total reviews.
- Resilience: If a downstream service (like the User service) is slow or down, the service is designed to return "Service Unavailable" for those specific fields rather than failing the entire request.

