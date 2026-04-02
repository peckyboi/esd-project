import json

from app import models
from app.rabbitmq_consumer import _process_message


def _make_body(event_type, data, event_id="evt-test-001"):
    return json.dumps({
        "event_id": event_id,
        "event_type": event_type,
        "data": data,
    }).encode()


def test_order_created_notifies_freelancer(db_session):
    body = _make_body("OrderCreated", {"order_id": 1, "freelancer_id": 101, "client_id": 5})
    _process_message(body, "msg-1")

    db_session.expire_all()
    notifications = db_session.query(models.Notification).all()
    assert len(notifications) == 1
    assert notifications[0].user_id == 101
    assert "new order" in notifications[0].message.lower()


def test_order_delivered_notifies_client(db_session):
    body = _make_body("OrderDelivered", {"order_id": 2, "client_id": 7, "freelancer_id": 101})
    _process_message(body, "msg-2")

    db_session.expire_all()
    notifications = db_session.query(models.Notification).all()
    assert len(notifications) == 1
    assert notifications[0].user_id == 7
    assert "delivered" in notifications[0].message.lower()


def test_order_completed_notifies_both(db_session):
    body = _make_body("OrderCompleted", {"order_id": 3, "freelancer_id": 101, "client_id": 7})
    _process_message(body, "msg-3")

    db_session.expire_all()
    notifications = db_session.query(models.Notification).all()
    assert len(notifications) == 2

    user_ids = {n.user_id for n in notifications}
    assert 101 in user_ids  # freelancer notified
    assert 7 in user_ids    # client notified


def test_order_disputed_notifies_freelancer(db_session):
    body = _make_body("OrderDisputed", {"order_id": 4, "freelancer_id": 202, "client_id": 5})
    _process_message(body, "msg-4")

    db_session.expire_all()
    notifications = db_session.query(models.Notification).all()
    assert len(notifications) == 1
    assert notifications[0].user_id == 202
    assert "disputed" in notifications[0].message.lower()


def test_order_cancelled_notifies_freelancer(db_session):
    body = _make_body("OrderCancelled", {"order_id": 5, "freelancer_id": 303, "client_id": 5})
    _process_message(body, "msg-5")

    db_session.expire_all()
    notifications = db_session.query(models.Notification).all()
    assert len(notifications) == 1
    assert notifications[0].user_id == 303
    assert "cancelled" in notifications[0].message.lower()


def test_duplicate_event_is_ignored(db_session):
    body = _make_body(
        "OrderCreated",
        {"order_id": 6, "freelancer_id": 101, "client_id": 5},
        event_id="evt-dupe-001",
    )
    _process_message(body, "msg-6")
    _process_message(body, "msg-6")

    db_session.expire_all()
    assert db_session.query(models.Notification).count() == 1


def test_unknown_event_type_is_ignored(db_session):
    body = _make_body("SomeRandomEvent", {"order_id": 7, "freelancer_id": 101})
    _process_message(body, "msg-7")

    db_session.expire_all()
    assert db_session.query(models.Notification).count() == 0


def test_missing_user_id_does_not_create_notification(db_session):
    body = _make_body("OrderCreated", {"order_id": 8})
    _process_message(body, "msg-8")

    db_session.expire_all()
    assert db_session.query(models.Notification).count() == 0