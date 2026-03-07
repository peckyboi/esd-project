from app import models

#response is what happens when we call the endpoint, contains status code, JSON and headers, similar to what you see in swagger
#assert is the check, so if it passes test continues if not it fails
#test - pytest function
#deliver - endpoint/action under test
#invalid_from_pending_payment - scenario
#_409 - expected result
def test_deliver_invalid_from_pending_payment_409(client, create_order_record):
    order = create_order_record(status=models.OrderStatus.PENDING_PAYMENT)
    response = client.patch(f"/orders/{order.id}/deliver")
    assert response.status_code == 409


def test_deliver_success_from_in_progress(client, create_order_record, publisher_mocks, db_session):
    order = create_order_record(status=models.OrderStatus.IN_PROGRESS)

    response = client.patch(f"/orders/{order.id}/deliver")
    assert response.status_code == 200
    assert response.json()["status"] == models.OrderStatus.DELIVERED.value

    db_session.expire_all()
    updated = db_session.query(models.Order).filter(models.Order.id == order.id).first()
    assert updated.status == models.OrderStatus.DELIVERED
    publisher_mocks["delivered"].assert_called_once() #publisher mocks is mimicking how ur messages are sent to RabbiMQ
    publisher_mocks["status_updated"].assert_called_once()


def test_approve_success_from_delivered(client, create_order_record, publisher_mocks, db_session):
    order = create_order_record(status=models.OrderStatus.DELIVERED)

    response = client.patch(f"/orders/{order.id}/approve")
    assert response.status_code == 200
    assert response.json()["status"] == models.OrderStatus.COMPLETED.value

    db_session.expire_all()
    updated = db_session.query(models.Order).filter(models.Order.id == order.id).first()
    assert updated.status == models.OrderStatus.COMPLETED
    publisher_mocks["completed"].assert_called_once()
    publisher_mocks["status_updated"].assert_called_once()


def test_dispute_success_from_delivered(client, create_order_record, publisher_mocks, db_session):
    order = create_order_record(status=models.OrderStatus.DELIVERED)

    response = client.patch(
        f"/orders/{order.id}/dispute",
        json={"dispute_reason": "Work does not match requirements"},
    )
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == models.OrderStatus.DISPUTED.value
    assert data["dispute_reason"] == "Work does not match requirements"
    assert data["disputed_at"] is not None

    db_session.expire_all()
    updated = db_session.query(models.Order).filter(models.Order.id == order.id).first()
    assert updated.status == models.OrderStatus.DISPUTED
    assert updated.dispute_reason == "Work does not match requirements"
    publisher_mocks["disputed"].assert_called_once()
    publisher_mocks["status_updated"].assert_called_once()


def test_settle_rejects_invalid_final_status_400(client, create_order_record):
    order = create_order_record(status=models.OrderStatus.DISPUTED)
    response = client.patch(
        f"/orders/{order.id}/settle",
        json={"final_status": models.OrderStatus.COMPLETED.value, "settlement_amount": 99.0},
    )
    assert response.status_code == 400


def test_settle_refunded_success_from_disputed(client, create_order_record, publisher_mocks, db_session):
    order = create_order_record(status=models.OrderStatus.DISPUTED)

    response = client.patch(
        f"/orders/{order.id}/settle",
        json={"final_status": models.OrderStatus.REFUNDED.value, "settlement_amount": 120.5},
    )
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == models.OrderStatus.REFUNDED.value
    assert data["settlement_amount"] == 120.5
    assert data["resolved_at"] is not None

    db_session.expire_all()
    updated = db_session.query(models.Order).filter(models.Order.id == order.id).first()
    assert updated.status == models.OrderStatus.REFUNDED
    publisher_mocks["status_updated"].assert_called_once()


def test_settle_released_success_from_disputed(client, create_order_record, publisher_mocks, db_session):
    order = create_order_record(status=models.OrderStatus.DISPUTED)

    response = client.patch(
        f"/orders/{order.id}/settle",
        json={"final_status": models.OrderStatus.RELEASED.value, "settlement_amount": 120.5},
    )
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == models.OrderStatus.RELEASED.value
    assert data["resolved_at"] is not None

    db_session.expire_all()
    updated = db_session.query(models.Order).filter(models.Order.id == order.id).first()
    assert updated.status == models.OrderStatus.RELEASED
    publisher_mocks["status_updated"].assert_called_once()


def test_settle_invalid_transition_when_not_disputed_409(client, create_order_record):
    order = create_order_record(status=models.OrderStatus.DELIVERED)
    response = client.patch(
        f"/orders/{order.id}/settle",
        json={"final_status": models.OrderStatus.REFUNDED.value, "settlement_amount": 10.0},
    )
    assert response.status_code == 409


def test_cancel_success_from_pending_payment(client, create_order_record, publisher_mocks, db_session):
    order = create_order_record(status=models.OrderStatus.PENDING_PAYMENT)

    response = client.patch(f"/orders/{order.id}/cancel")
    assert response.status_code == 200
    assert response.json()["status"] == models.OrderStatus.CANCELLED.value

    db_session.expire_all()
    updated = db_session.query(models.Order).filter(models.Order.id == order.id).first()
    assert updated.status == models.OrderStatus.CANCELLED
    publisher_mocks["cancelled"].assert_called_once()
    publisher_mocks["status_updated"].assert_called_once()


def test_cancel_invalid_transition_from_completed_409(client, create_order_record):
    order = create_order_record(status=models.OrderStatus.COMPLETED)
    response = client.patch(f"/orders/{order.id}/cancel")
    assert response.status_code == 409
