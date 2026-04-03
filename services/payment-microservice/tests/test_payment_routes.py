"""
Tests for the Payment Microservice.
Run with: pytest tests/
"""
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.database import Base, get_db
from app.main import app

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
    "amount": 50.00,
}


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@patch("app.routes.payment_routes.stripe_client.create_payment_intent")
def test_hold_payment_success(mock_stripe):
    mock_stripe.return_value = {"success": True, "payment_intent_id": "pi_test_123"}
    response = client.post("/payments/hold", json=SAMPLE_PAYMENT)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "held"
    assert data["stripe_payment_intent_id"] == "pi_test_123"
    assert data["order_id"] == 1


@patch("app.routes.payment_routes.stripe_client.create_payment_intent")
def test_hold_payment_stripe_failure(mock_stripe):
    mock_stripe.return_value = {"success": False, "error": "Card declined"}
    response = client.post("/payments/hold", json=SAMPLE_PAYMENT)
    assert response.status_code == 400
    assert "Stripe payment failed" in response.json()["detail"]


def test_hold_payment_missing_fields():
    response = client.post("/payments/hold", json={"order_id": 1})
    assert response.status_code == 422


@patch("app.routes.payment_routes.stripe_client.create_payment_intent")
@patch("app.routes.payment_routes.stripe_client.capture_payment_intent")
def test_release_payment_success(mock_capture, mock_stripe):
    mock_stripe.return_value = {"success": True, "payment_intent_id": "pi_test_456"}
    mock_capture.return_value = {
        "success": True,
        "payment_intent_id": "pi_test_456",
        "status": "succeeded",
    }

    hold_res = client.post(
        "/payments/hold",
        json={"order_id": 2, "client_id": 1, "freelancer_id": 2, "amount": 75.00},
    )
    payment_id = hold_res.json()["payment_id"]

    response = client.patch("/payments/release", json={"payment_id": payment_id})
    assert response.status_code == 200
    assert response.json()["status"] == "released"


def test_release_payment_not_found():
    response = client.patch("/payments/release", json={"payment_id": 99999})
    assert response.status_code == 404


@patch("app.routes.payment_routes.stripe_client.create_payment_intent")
@patch("app.routes.payment_routes.stripe_client.refund_payment_intent")
def test_refund_payment_success(mock_refund, mock_stripe):
    mock_stripe.return_value = {"success": True, "payment_intent_id": "pi_test_789"}
    mock_refund.return_value = {"success": True, "refund_id": "re_test_001", "status": "succeeded"}

    hold_res = client.post(
        "/payments/hold",
        json={"order_id": 3, "client_id": 1, "freelancer_id": 2, "amount": 100.00},
    )
    payment_id = hold_res.json()["payment_id"]

    response = client.patch("/payments/refund", json={"payment_id": payment_id})
    assert response.status_code == 200
    assert response.json()["status"] == "refunded"


@patch("app.routes.payment_routes.stripe_client.create_payment_intent")
@patch("app.routes.payment_routes.stripe_client.capture_payment_intent")
def test_cannot_refund_released_payment(mock_capture, mock_stripe):
    mock_stripe.return_value = {"success": True, "payment_intent_id": "pi_test_999"}
    mock_capture.return_value = {
        "success": True,
        "payment_intent_id": "pi_test_999",
        "status": "succeeded",
    }

    hold_res = client.post(
        "/payments/hold",
        json={"order_id": 4, "client_id": 1, "freelancer_id": 2, "amount": 60.00},
    )
    payment_id = hold_res.json()["payment_id"]
    client.patch("/payments/release", json={"payment_id": payment_id})

    response = client.patch("/payments/refund", json={"payment_id": payment_id})
    assert response.status_code == 409
    assert "Cannot refund" in response.json()["detail"]


@patch("app.routes.payment_routes.stripe_client.create_payment_intent")
def test_get_payment(mock_stripe):
    mock_stripe.return_value = {"success": True, "payment_intent_id": "pi_test_get"}
    hold_res = client.post(
        "/payments/hold",
        json={"order_id": 5, "client_id": 1, "freelancer_id": 2, "amount": 45.00},
    )
    payment_id = hold_res.json()["payment_id"]

    response = client.get(f"/payments/{payment_id}")
    assert response.status_code == 200
    assert response.json()["payment_id"] == payment_id


def test_get_payment_not_found():
    response = client.get("/payments/99999")
    assert response.status_code == 404


@patch("app.routes.payment_routes.stripe_client.create_payment_intent")
def test_list_payments(mock_stripe):
    mock_stripe.return_value = {"success": True, "payment_intent_id": "pi_test_list"}
    client.post(
        "/payments/hold",
        json={"order_id": 777, "client_id": 1, "freelancer_id": 2, "amount": 55.00},
    )

    response = client.get("/payments")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert any(p["order_id"] == 777 for p in response.json())
