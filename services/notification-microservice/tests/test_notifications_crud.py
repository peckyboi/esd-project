def test_get_notifications_returns_empty_for_unknown_user(client):
    response = client.get("/notifications/999")
    assert response.status_code == 200
    assert response.json() == []


def test_get_notifications_returns_correct_user_only(client, create_notification_record):
    create_notification_record(user_id=1)
    create_notification_record(user_id=1)
    create_notification_record(user_id=2)

    response = client.get("/notifications/1")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_notifications_response_shape(client, create_notification_record):
    create_notification_record(user_id=1, order_id=42, message="Test message")

    response = client.get("/notifications/1")
    assert response.status_code == 200
    notif = response.json()[0]

    assert "id" in notif
    assert "user_id" in notif
    assert "order_id" in notif
    assert "message" in notif
    assert "created_at" in notif
    assert notif["user_id"] == 1
    assert notif["order_id"] == 42
    assert notif["message"] == "Test message"