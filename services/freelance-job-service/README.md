# Freelance Job Microservice

Atomic microservice responsible for managing freelance gig listings on the platform.

## Responsibilities
- CRUD operations for gig listings
- Filtering and searching gigs by category, price range, keyword, or freelancer
- Soft-deletion (gigs are marked `deleted`, not removed from the DB)

## Tech Stack
- **Language**: Python 3.11
- **Framework**: FastAPI
- **Database**: MySQL 8.0 (via SQLAlchemy ORM)
- **Container**: Docker

---

## API Endpoints

| Method | Endpoint         | Description                              |
|--------|------------------|------------------------------------------|
| GET    | `/health`        | Health check                             |
| POST   | `/gigs/`         | Create a new gig listing                 |
| GET    | `/gigs/`         | List/filter gigs (see query params below)|
| GET    | `/gigs/{gig_id}` | Get a single gig by ID                   |
| PUT    | `/gigs/{gig_id}` | Update a gig                             |
| DELETE | `/gigs/{gig_id}` | Soft-delete a gig                        |

### Query Parameters for `GET /gigs/`
| Param          | Type    | Description                        |
|----------------|---------|------------------------------------|
| `category`     | string  | Filter by category (partial match) |
| `min_price`    | float   | Minimum price filter               |
| `max_price`    | float   | Maximum price filter               |
| `search`       | string  | Search in title and description    |
| `freelancer_id`| string  | Filter gigs by a specific freelancer|
| `skip`         | int     | Pagination offset (default: 0)     |
| `limit`        | int     | Max results (default: 20, max: 100)|

---

## Running Locally (with Docker)

Since `docker-compose.yml` is not committed (it will be part of the team's `infra/` setup), 
create a `docker-compose.yml` file inside `freelance-job-service/` with the following contents:
```yaml
services:
  freelance-job-service:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "5002:5000"
    environment:
      - ENVIRONMENT=production
      - DB_HOST=freelance-job-db
      - DB_PORT=3306
      - DB_USER=root
      - DB_PASSWORD=password123
      - DB_NAME=freelance_job_db
    depends_on:
      freelance-job-db:
        condition: service_healthy

  freelance-job-db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password123
      - MYSQL_DATABASE=freelance_job_db
    ports:
      - "3307:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-ppassword123"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 30s
```

Then run from the `freelance-job-service/` folder:
```bash
docker compose up --build
```

The API will be available at `http://localhost:5002/docs`

> Note: If Docker Hub login fails, connect to a mobile hotspot and run `docker login` first.

## Running Tests

```bash
pip install -r requirements.txt
pip install pytest httpx
pytest tests/
```

---

## Environment Variables

| Variable                  | Default           | Description              |
|---------------------------|-------------------|--------------------------|
| `DB_HOST`                 | `localhost`       | MySQL host               |
| `DB_PORT`                 | `3306`            | MySQL port               |
| `DB_USER`                 | `root`            | MySQL user               |
| `DB_PASSWORD`             | `password`        | MySQL password           |
| `DB_NAME`                 | `freelance_job_db`| Database name            |

Set these via the `infra/docker-compose.yml` environment block or a `.env` file.

---

## Notes for Teammates

- **Do not** access this service's `freelance_job_db` database directly from another service. Call the HTTP API instead.
- The `freelancer_id` field is a string reference to the **User Account Microservice** — this service does not validate it.
- Deleted gigs are **soft-deleted** (status = `deleted`). They remain in the DB for data integrity but won't appear in any GET responses.
- See `docker-compose.snippet.yml` for the block to add to `infra/docker-compose.yml`.
