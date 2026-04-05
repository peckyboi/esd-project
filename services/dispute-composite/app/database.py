import os
import time

from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import OperationalError

DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_NAME = os.getenv("DB_NAME", "dispute_composite_db")

MYSQL_SERVER_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}"
DATABASE_URL = f"{MYSQL_SERVER_URL}/{DB_NAME}"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def ensure_database_exists():
    temp_engine = create_engine(MYSQL_SERVER_URL, pool_pre_ping=True)
    with temp_engine.connect() as conn:
        conn.execute(text(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}`"))
        conn.commit()
    temp_engine.dispose()


def wait_for_database(max_attempts: int = 30, delay_seconds: float = 2.0) -> None:
    last_error = None
    for attempt in range(1, max_attempts + 1):
        try:
            ensure_database_exists()
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return
        except OperationalError as exc:
            last_error = exc
            if attempt == max_attempts:
                break
            print(
                f"[dispute-composite] DB not ready yet "
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
