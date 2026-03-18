import os
import sys
from pathlib import Path
from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

SERVICE_ROOT = Path(__file__).resolve().parents[1]
if str(SERVICE_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVICE_ROOT))

#force db to use SQLite 
os.environ["DATABASE_URL"] = "sqlite:///./test_order.db"

from app import database, models  
import app.main as main_module  

TEST_DATABASE_URL = "sqlite:///./test_order.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
models.Base.metadata.create_all(bind=engine)

#use local db
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


main_module.app.dependency_overrides[database.get_db] = override_get_db

#provides client for calling endpoints
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
    db_session.query(models.Order).delete()
    db_session.commit()


@pytest.fixture
def canonical_order_payload():
    return {
        "client_id": 1,
        "freelancer_id": 101,
        "gig_id": 1,
        "price": 120.5,
    }


@pytest.fixture
def create_order_record(db_session):
    def _create_order(status=models.OrderStatus.PENDING_PAYMENT, **overrides):
        order = models.Order(
            client_id=overrides.get("client_id", 1),
            freelancer_id=overrides.get("freelancer_id", 101),
            gig_id=overrides.get("gig_id", 1),
            price=overrides.get("price", 120.5),
            status=status,
            payment_transaction_id=overrides.get("payment_transaction_id"),
            dispute_reason=overrides.get("dispute_reason"),
            settlement_amount=overrides.get("settlement_amount"),
            disputed_at=overrides.get("disputed_at"),
            resolved_at=overrides.get("resolved_at"),
        )
        db_session.add(order)
        db_session.commit()
        db_session.refresh(order)
        return order

    return _create_order


@pytest.fixture
def publisher_mocks(monkeypatch):
    created = Mock()
    delivered = Mock()
    completed = Mock()
    disputed = Mock()
    cancelled = Mock()
    status_updated = Mock()

    monkeypatch.setattr(main_module.rabbitmq_pub, "publish_order_created_event", created)
    monkeypatch.setattr(main_module.rabbitmq_pub, "publish_order_delivered_event", delivered)
    monkeypatch.setattr(main_module.rabbitmq_pub, "publish_order_completed_event", completed)
    monkeypatch.setattr(main_module.rabbitmq_pub, "publish_order_disputed_event", disputed)
    monkeypatch.setattr(main_module.rabbitmq_pub, "publish_order_cancelled_event", cancelled)
    monkeypatch.setattr(main_module.rabbitmq_pub, "publish_order_status_updated_event", status_updated)

    return {
        "created": created,
        "delivered": delivered,
        "completed": completed,
        "disputed": disputed,
        "cancelled": cancelled,
        "status_updated": status_updated,
    }
