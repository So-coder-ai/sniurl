import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base, get_db

TEST_DB_URL = "sqlite:///./test.db"

engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(app, raise_server_exceptions=False)


@pytest.fixture
def auth_client(client):
    client.post("/auth/register", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpass123",
    })
    resp = client.post("/auth/login", data={"username": "testuser", "password": "testpass123"})
    token = resp.json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client


class TestAuth:
    def test_register(self, client):
        resp = client.post("/auth/register", json={
            "email": "new@example.com",
            "username": "newuser",
            "password": "securepass1",
        })
        assert resp.status_code == 201
        assert resp.json()["username"] == "newuser"

    def test_register_duplicate_email(self, client):
        payload = {"email": "dup@example.com", "username": "u1", "password": "pass12345"}
        client.post("/auth/register", json=payload)
        payload["username"] = "u2"
        resp = client.post("/auth/register", json=payload)
        assert resp.status_code == 409

    def test_login(self, client):
        client.post("/auth/register", json={
            "email": "login@example.com", "username": "loginuser", "password": "loginpass1"
        })
        resp = client.post("/auth/login", data={"username": "loginuser", "password": "loginpass1"})
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    def test_login_wrong_password(self, client):
        client.post("/auth/register", json={
            "email": "x@example.com", "username": "xuser", "password": "correctpass1"
        })
        resp = client.post("/auth/login", data={"username": "xuser", "password": "wrongpass"})
        assert resp.status_code == 401


class TestURLs:
    def test_shorten_anonymous(self, client):
        resp = client.post("/urls", json={"original_url": "https://example.com"})
        assert resp.status_code == 201
        data = resp.json()
        assert "short_code" in data
        assert "short_url" in data

    def test_shorten_custom_alias(self, auth_client):
        resp = auth_client.post("/urls", json={
            "original_url": "https://example.com",
            "custom_alias": "myalias",
        })
        assert resp.status_code == 201
        assert resp.json()["short_code"] == "myalias"

    def test_duplicate_alias(self, auth_client):
        auth_client.post("/urls", json={"original_url": "https://a.com", "custom_alias": "same"})
        resp = auth_client.post("/urls", json={"original_url": "https://b.com", "custom_alias": "same"})
        assert resp.status_code == 409

    def test_invalid_url(self, client):
        resp = client.post("/urls", json={"original_url": "not-a-url"})
        assert resp.status_code == 422

    def test_redirect(self, client):
        resp = client.post("/urls", json={"original_url": "https://example.com"})
        code = resp.json()["short_code"]
        redir = client.get(f"/{code}", follow_redirects=False)
        assert redir.status_code == 302
        assert redir.headers["location"] == "https://example.com"

    def test_redirect_not_found(self, client):
        resp = client.get("/nonexistent", follow_redirects=False)
        assert resp.status_code == 404

    def test_list_my_urls(self, auth_client):
        auth_client.post("/urls", json={"original_url": "https://example.com"})
        resp = auth_client.get("/urls/me")
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    def test_update_url(self, auth_client):
        resp = auth_client.post("/urls", json={"original_url": "https://example.com"})
        code = resp.json()["short_code"]
        patch = auth_client.patch(f"/urls/{code}", json={"is_active": False})
        assert patch.status_code == 200
        assert patch.json()["is_active"] is False

    def test_delete_url(self, auth_client):
        resp = auth_client.post("/urls", json={"original_url": "https://example.com"})
        code = resp.json()["short_code"]
        delete = auth_client.delete(f"/urls/{code}")
        assert delete.status_code == 204

    def test_delete_other_users_url(self, client, auth_client):
        resp = client.post("/urls", json={"original_url": "https://example.com"})
        code = resp.json()["short_code"]
        delete = auth_client.delete(f"/urls/{code}")
        assert delete.status_code == 403

    def test_stats_requires_auth(self, client):
        resp = client.post("/urls", json={"original_url": "https://example.com"})
        code = resp.json()["short_code"]
        stats = client.get(f"/urls/{code}/stats")
        assert stats.status_code == 401
