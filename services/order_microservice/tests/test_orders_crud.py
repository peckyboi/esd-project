from app import models


def test_create_order_success(client, canonical_order_payload, publisher_mocks, db_session):
    response = client.post("/orders", json=canonical_order_payload)
    assert response.status_code == 201

    data = response.json()
    assert data["client_id"] == canonical_order_payload["client_id"]
    assert data["freelancer_id"] == canonical_order_payload["freelancer_id"]
    assert data["gig_id"] == canonical_order_payload["gig_id"]
    assert data["price"] == canonical_order_payload["price"]
    assert data["order_description"] == canonical_order_payload["order_description"]
    assert data["status"] == models.OrderStatus.PENDING_PAYMENT.value

    order = db_session.query(models.Order).filter(models.Order.id == data["id"]).first()
    assert order is not None
    publisher_mocks["created"].assert_called_once()


def test_get_order_by_id_success(client, canonical_order_payload):
    create_response = client.post("/orders", json=canonical_order_payload)
    order_id = create_response.json()["id"]

    response = client.get(f"/orders/{order_id}")
    assert response.status_code == 200
    assert response.json()["id"] == order_id


def test_get_order_not_found(client):
    response = client.get("/orders/99999")
    assert response.status_code == 404
