from app import models


def test_create_order_missing_required_fields_422(client):
    response = client.post(
        "/orders",
        json={
            "client_id": "client-1",
            "gig_id": "gig-1",
            "price": 10.0,
        },
    )
    assert response.status_code == 422


def test_dispute_missing_reason_422(client, create_order_record):
    order = create_order_record(status=models.OrderStatus.DELIVERED)
    response = client.patch(f"/orders/{order.id}/dispute", json={})
    assert response.status_code == 422


def test_settle_missing_final_status_422(client, create_order_record):
    order = create_order_record(status=models.OrderStatus.DISPUTED)
    response = client.patch(f"/orders/{order.id}/settle", json={"settlement_amount": 20.0})
    assert response.status_code == 422
