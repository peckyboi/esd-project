from app import models


def test_list_orders_returns_created_orders(client, create_order_record):
    create_order_record(client_id=1)
    create_order_record(client_id=2)

    response = client.get("/orders")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_list_orders_filter_by_client_id(client, create_order_record):
    create_order_record(client_id=1)
    create_order_record(client_id=2)

    response = client.get("/orders", params={"client_id": 1})
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 1
    assert data[0]["client_id"] == 1


def test_list_orders_filter_by_freelancer_id(client, create_order_record):
    create_order_record(freelancer_id=201)
    create_order_record(freelancer_id=202)

    response = client.get("/orders", params={"freelancer_id": 202})
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 1
    assert data[0]["freelancer_id"] == 202


def test_list_orders_filter_by_status(client, create_order_record):
    create_order_record(status=models.OrderStatus.PENDING_PAYMENT)
    create_order_record(status=models.OrderStatus.DELIVERED)

    response = client.get("/orders", params={"status_filter": models.OrderStatus.DELIVERED.value})
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 1
    assert data[0]["status"] == models.OrderStatus.DELIVERED.value
