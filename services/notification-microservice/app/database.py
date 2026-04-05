import os
import time
from sqlalchemy import create_engine
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:rootpassword@localhost:3306/notification_db"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def wait_for_database(max_attempts: int = 30, delay_seconds: float = 2.0) -> None:
    last_error = None
    for attempt in range(1, max_attempts + 1):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return
        except OperationalError as exc:
            last_error = exc
            if attempt == max_attempts:
                break
            print(
                f"[notification-microservice] DB not ready yet "
                f"(attempt {attempt}/{max_attempts}). Retrying in {delay_seconds}s..."
            )
            time.sleep(delay_seconds)

    raise RuntimeError(
        f"Database not reachable after {max_attempts} attempts."
    ) from last_error


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
