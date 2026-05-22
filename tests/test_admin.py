import base64

import pytest
from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import app
from app.storage import Lead, reset_store_singleton


@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("STORE_BACKEND", "sqlite")
    monkeypatch.setenv("DB_PATH", str(tmp_path / "admin.db"))
    monkeypatch.setenv("ADMIN_USERNAME", "tester")
    monkeypatch.setenv("ADMIN_PASSWORD", "secret123")
    get_settings.cache_clear()  # type: ignore[attr-defined]
    reset_store_singleton()
    return TestClient(app)


def _auth(user: str, pw: str) -> dict:
    token = base64.b64encode(f"{user}:{pw}".encode()).decode()
    return {"Authorization": f"Basic {token}"}


def test_admin_requires_auth(client):
    assert client.get("/admin").status_code == 401


def test_admin_bad_password(client):
    assert client.get("/admin", headers=_auth("tester", "nope")).status_code == 401


def test_admin_index_lists_conversations(client):
    from app.storage import get_store

    store = get_store()
    store.append_message("user-A", "user", "hi")
    store.append_message("user-A", "assistant", "hello")
    store.add_lead(Lead(sender_id="user-A", kind="repair_quote", summary="iPhone screen"))

    r = client.get("/admin", headers=_auth("tester", "secret123"))
    assert r.status_code == 200
    assert "user-A" in r.text


def test_admin_conversation_view_and_takeover(client):
    from app.storage import get_store

    store = get_store()
    store.append_message("user-B", "user", "is the phone ready?")

    r = client.get("/admin/conversations/user-B", headers=_auth("tester", "secret123"))
    assert r.status_code == 200
    assert "is the phone ready?" in r.text

    r = client.post(
        "/admin/conversations/user-B/takeover",
        data={"on": "1"},
        headers=_auth("tester", "secret123"),
        follow_redirects=False,
    )
    assert r.status_code == 303
    assert store.get_conversation("user-B").human_takeover is True


def test_admin_locked_when_password_blank(tmp_path, monkeypatch):
    monkeypatch.setenv("STORE_BACKEND", "memory")
    monkeypatch.setenv("ADMIN_PASSWORD", "")
    get_settings.cache_clear()  # type: ignore[attr-defined]
    reset_store_singleton()
    c = TestClient(app)
    assert c.get("/admin", headers=_auth("admin", "")).status_code == 503
