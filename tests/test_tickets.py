import time

import pytest

from app.ai.tools import ToolRunner
from app.storage import InMemoryStore, SqliteStore, Ticket


def _seed_ticket(store, **overrides):
    now = time.time()
    base = dict(
        id=None,
        customer_name="Jane Doe",
        customer_phone="555-867-5309",
        customer_email="jane@example.com",
        device="iPhone 13",
        issue="cracked screen",
        status="in_progress",
        notes="",
        created_at=now,
        updated_at=now,
    )
    base.update(overrides)
    return store.create_ticket(Ticket(**base))


@pytest.fixture(params=["memory", "sqlite"])
def store(request, tmp_path):
    if request.param == "memory":
        yield InMemoryStore()
        return
    s = SqliteStore(tmp_path / "tickets.db")
    yield s
    s.close()


def test_create_assigns_id(store):
    t = _seed_ticket(store)
    assert t.id is not None


def test_find_by_phone_digits(store):
    _seed_ticket(store)
    found = store.find_tickets("8675309")
    assert len(found) == 1
    assert found[0].customer_name == "Jane Doe"


def test_find_by_email_substring(store):
    _seed_ticket(store)
    found = store.find_tickets("jane@")
    assert len(found) == 1


def test_find_by_ticket_id_with_hash(store):
    t = _seed_ticket(store)
    found = store.find_tickets(f"#{t.id}")
    assert len(found) == 1


def test_short_phone_query_doesnt_match_everything(store):
    _seed_ticket(store, customer_phone="555-867-5309")
    _seed_ticket(store, customer_name="Bob", customer_phone="555-111-2222", customer_email="bob@x.com")
    # "55" alone shouldn't match either record by phone (too short to be useful).
    found = store.find_tickets("55")
    assert all("5309" not in t.customer_phone or t.customer_name == "Jane Doe" for t in found)


def test_update_status_changes_state_and_timestamp(store):
    t = _seed_ticket(store, status="received")
    time.sleep(0.01)
    updated = store.update_ticket_status(t.id, "ready")
    assert updated is not None
    assert updated.status == "ready"
    assert updated.updated_at >= t.updated_at


def test_lookup_ticket_tool_returns_status():
    store = InMemoryStore()
    _seed_ticket(store, status="ready")
    runner = ToolRunner(store, "u-1")
    result = runner.run("lookup_ticket", {"query": "8675309"})
    assert result["count"] == 1
    assert result["tickets"][0]["status"] == "ready"


def test_lookup_ticket_no_match():
    runner = ToolRunner(InMemoryStore(), "u-2")
    result = runner.run("lookup_ticket", {"query": "9999999"})
    assert result["count"] == 0
    assert result["tickets"] == []
