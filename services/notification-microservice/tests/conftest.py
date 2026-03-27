import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

SERVICE_ROOT = Path(__file__).resolve().parents[1]
if str(SERVICE_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVICE_ROOT))

os.environ["DATABASE_URL"] = "sqlite:///./test_notification.db"

from app import database, models
import app.main as main_module
import app.rabbitmq_consumer as consumer_module

TEST_DATABASE_URL = "sqlite:///./test_notification.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
models.Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


main_module.app.dependency_overrides[database.get_db] = override_get_db

# redirect the consumer's SessionLocal to the same SQLite test DB
# without this, _process_message() would try to connect to MySQL and fail
consumer_module.SessionLocal = TestingSessionLocal


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(main_module.rabbitmq_consumer, "start_consumer_in_background", lambda: None)
    with TestClient(main_module.app) as test_client:
        yield test_client


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def reset_db(db_session):
    db_session.query(models.ProcessedEvent).delete()
    db_session.query(models.Notification).delete()
    db_session.commit()


@pytest.fixture
def create_notification_record(db_session):
    def _create(user_id=1, order_id=10, message="Test notification"):
        notification = models.Notification(
            user_id=user_id,
            order_id=order_id,
            message=message,
        )
        db_session.add(notification)
        db_session.commit()
        db_session.refresh(notification)
        return notification
    return _create