"""
Basic tests for the Freelance Job Microservice.
Run with: pytest tests/
"""
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.database import Base, get_db

# Use in-memory SQLite for tests (no MySQL needed)
SQLALCHEMY_TEST_URL = "sqlite:///./test.db"
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

SAMPLE_GIG = {
    "freelancer_id": 1,
    "title": "I will design your logo",
    "description": "Professional logo design with unlimited revisions",
    "category": "design",
    "price": 50.0,
    "delivery_days": 3,
    "image_url": None,
}


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_create_gig():
    response = client.post("/gigs/", json=SAMPLE_GIG)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == SAMPLE_GIG["title"]
    assert data["status"] == "active"
    assert "gig_id" in data


def test_get_gigs():
    response = client.get("/gigs/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_gig_by_id():
    # Create first
    create_res = client.post("/gigs/", json=SAMPLE_GIG)
    gig_id = create_res.json()["gig_id"]

    response = client.get(f"/gigs/{gig_id}")
    assert response.status_code == 200
    assert response.json()["gig_id"] == gig_id


def test_get_gig_not_found():
    response = client.get("/gigs/99999")
    assert response.status_code == 404


def test_update_gig():
    create_res = client.post("/gigs/", json=SAMPLE_GIG)
    gig_id = create_res.json()["gig_id"]

    update_res = client.put(f"/gigs/{gig_id}", json={"price": 75.0, "title": "I will design your amazing logo"})
    assert update_res.status_code == 200
    assert update_res.json()["price"] == 75.0


def test_delete_gig():
    create_res = client.post("/gigs/", json=SAMPLE_GIG)
    gig_id = create_res.json()["gig_id"]

    delete_res = client.delete(f"/gigs/{gig_id}")
    assert delete_res.status_code == 200

    # Should no longer be fetchable after soft delete
    get_res = client.get(f"/gigs/{gig_id}")
    assert get_res.status_code == 404


def test_filter_gigs_by_category():
    client.post("/gigs/", json={**SAMPLE_GIG, "category": "writing"})
    response = client.get("/gigs/?category=writing")
    assert response.status_code == 200
    for gig in response.json():
        assert "writing" in gig["category"].lower()
