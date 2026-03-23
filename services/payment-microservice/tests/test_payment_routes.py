"""
Tests for the Payment Microservice.
Run with: pytest tests/
"""
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.database import Base, get_db

# Use SQLite for tests
SQLALCHEMY_TEST_URL = "sqlite:///./test_payment.db"
engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

SAMPLE_PAYMENT = {
    "order_id": 1,
    "client_id": 1,
    "freelancer_id": 2,
    "amount": 50.00
}


# --- Health Check ---

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


# --- Hold Payment ---

@patch("app.routes.payment_routes.stripe_client.create_payment_intent")
@patch("app.routes.payment_routes.rabbitmq.publish_payment_success")
def test_hold_payment_success(mock_publish, mock_stripe):
    mock_stripe.return_value = {
        "success": True,
        "payment_intent_id": "pi_test_123"
    }
    mock_publish.return_value = None

    response = client.post("/payments/hold", json=SAMPLE_PAYMENT)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "held"
    assert data["stripe_payment_intent_id"] == "pi_test_123"
    assert data["order_id"] == 1
    mock_publish.assert_called_once()


@patch("app.routes.payment_routes.stripe_client.create_payment_intent")
@patch("app.routes.payment_routes.rabbitmq.publish_payment_failed")
def test_hold_payment_stripe_failure(mock_publish, mock_stripe):
    mock_stripe.return_value = {
        "success": False,
        "error": "Card declined"
    }
    mock_publish.return_value = None

    response = client.post("/payments/hold", json=SAMPLE_PAYMENT)
    assert response.status_code == 400
    assert "Stripe payment failed" in response.json()["detail"]
    mock_publish.assert_called_once()


def test_hold_payment_missing_fields():
    response = client.post("/payments/hold", json={"order_id": 1})
    assert response.status_code == 422


# --- Release Payment ---

@patch("app.routes.payment_routes.stripe_client.create_payment_intent")
@patch("app.routes.payment_routes.rabbitmq.publish_payment_success")
@patch("app.routes.payment_routes.stripe_client.capture_payment_intent")
@patch("app.routes.payment_routes.rabbitmq.publish_payment_completed")
def test_release_payment_success(mock_completed, mock_capture, mock_publish, mock_stripe):
    mock_stripe.return_value = {"success": True, "payment_intent_id": "pi_test_456"}
    mock_publish.return_value = None
    mock_capture.return_value = {"success": True, "payment_intent_id": "pi_test_456", "status": "succeeded"}
    mock_completed.return_value = None

    # Create a held payment first
    hold_res = client.post("/payments/hold", json={
        "order_id": 2,
        "client_id": 1,
        "freelancer_id": 2,
        "amount": 75.00
    })
    payment_id = hold_res.json()["payment_id"]

    response = client.patch("/payments/release", json={"payment_id": payment_id})
    assert response.status_code == 200
    assert response.json()["status"] == "released"
    mock_completed.assert_called_once()


@patch("app.routes.payment_routes.stripe_client.create_payment_intent")
@patch("app.routes.payment_routes.rabbitmq.publish_payment_success")
def test_release_payment_not_found(mock_publish, mock_stripe):
    response = client.patch("/payments/release", json={"payment_id": 99999})
    assert response.status_code == 404


# --- Refund Payment ---

@patch("app.routes.payment_routes.stripe_client.create_payment_intent")
@patch("app.routes.payment_routes.rabbitmq.publish_payment_success")
@patch("app.routes.payment_routes.stripe_client.refund_payment_intent")
@patch("app.routes.payment_routes.rabbitmq.publish_payment_completed")
def test_refund_payment_success(mock_completed, mock_refund, mock_publish, mock_stripe):
    mock_stripe.return_value = {"success": True, "payment_intent_id": "pi_test_789"}
    mock_publish.return_value = None
    mock_refund.return_value = {"success": True, "refund_id": "re_test_001", "status": "succeeded"}
    mock_completed.return_value = None

    # Create a held payment first
    hold_res = client.post("/payments/hold", json={
        "order_id": 3,
        "client_id": 1,
        "freelancer_id": 2,
        "amount": 100.00
    })
    payment_id = hold_res.json()["payment_id"]

    response = client.patch("/payments/refund", json={"payment_id": payment_id})
    assert response.status_code == 200
    assert response.json()["status"] == "refunded"
    mock_completed.assert_called_once()


@patch("app.routes.payment_routes.stripe_client.create_payment_intent")
@patch("app.routes.payment_routes.rabbitmq.publish_payment_success")
@patch("app.routes.payment_routes.stripe_client.capture_payment_intent")
@patch("app.routes.payment_routes.rabbitmq.publish_payment_completed")
def test_cannot_refund_released_payment(mock_completed, mock_capture, mock_publish, mock_stripe):
    mock_stripe.return_value = {"success": True, "payment_intent_id": "pi_test_999"}
    mock_publish.return_value = None
    mock_capture.return_value = {"success": True, "payment_intent_id": "pi_test_999", "status": "succeeded"}
    mock_completed.return_value = None

    # Create and release a payment
    hold_res = client.post("/payments/hold", json={
        "order_id": 4,
        "client_id": 1,
        "freelancer_id": 2,
        "amount": 60.00
    })
    payment_id = hold_res.json()["payment_id"]
    client.patch("/payments/release", json={"payment_id": payment_id})

    # Try to refund an already released payment
    response = client.patch("/payments/refund", json={"payment_id": payment_id})
    assert response.status_code == 409
    assert "Cannot refund" in response.json()["detail"]


# --- Get Payment ---

@patch("app.routes.payment_routes.stripe_client.create_payment_intent")
@patch("app.routes.payment_routes.rabbitmq.publish_payment_success")
def test_get_payment(mock_publish, mock_stripe):
    mock_stripe.return_value = {"success": True, "payment_intent_id": "pi_test_get"}
    mock_publish.return_value = None

    hold_res = client.post("/payments/hold", json={
        "order_id": 5,
        "client_id": 1,
        "freelancer_id": 2,
        "amount": 45.00
    })
    payment_id = hold_res.json()["payment_id"]

    response = client.get(f"/payments/{payment_id}")
    assert response.status_code == 200
    assert response.json()["payment_id"] == payment_id


def test_get_payment_not_found():
    response = client.get("/payments/99999")
    assert response.status_code == 404
