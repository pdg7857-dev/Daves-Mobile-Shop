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


def test_leads_csv_export(client):
    from app.storage import Lead, get_store

    store = get_store()
    store.add_lead(
        Lead(
            sender_id="csv-user",
            kind="sell_device",
            summary="Wants to trade in iPhone 12",
            device="iPhone 12",
            contact="555-1212",
        )
    )
    r = client.get("/admin/leads.csv", headers=_auth("tester", "secret123"))
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("text/csv")
    assert "attachment" in r.headers["content-disposition"]
    body = r.text
    assert "kind,sender_id" in body  # header row
    assert "csv-user" in body and "555-1212" in body


def test_inventory_view(client):
    r = client.get("/admin/inventory", headers=_auth("tester", "secret123"))
    assert r.status_code == 200
    # The seeded inventory has at least one iPhone 13 row.
    assert "iPhone 13" in r.text


def test_ticket_create_and_status_update(client):
    r = client.post(
        "/admin/tickets",
        data={
            "customer_name": "Sam",
            "customer_phone": "555-0001",
            "customer_email": "sam@x.com",
            "device": "iPhone 14",
            "issue": "battery",
            "status": "received",
            "notes": "needs same-day",
        },
        headers=_auth("tester", "secret123"),
        follow_redirects=False,
    )
    assert r.status_code == 303

    from app.storage import get_store

    tickets = get_store().list_tickets()
    assert len(tickets) == 1
    t = tickets[0]
    assert t.status == "received"

    r = client.post(
        f"/admin/tickets/{t.id}/status",
        data={"status": "ready"},
        headers=_auth("tester", "secret123"),
        follow_redirects=False,
    )
    assert r.status_code == 303
    assert get_store().list_tickets()[0].status == "ready"


def test_ticket_status_validation(client):
    r = client.post(
        "/admin/tickets/999/status",
        data={"status": "bogus"},
        headers=_auth("tester", "secret123"),
    )
    assert r.status_code == 400


def test_admin_locked_when_password_blank(tmp_path, monkeypatch):
    monkeypatch.setenv("STORE_BACKEND", "memory")
    monkeypatch.setenv("ADMIN_PASSWORD", "")
    get_settings.cache_clear()  # type: ignore[attr-defined]
    reset_store_singleton()
    c = TestClient(app)
    assert c.get("/admin", headers=_auth("admin", "")).status_code == 503
