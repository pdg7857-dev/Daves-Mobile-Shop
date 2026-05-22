from pathlib import Path

import pytest

from app.storage import Lead, SqliteStore


@pytest.fixture()
def store(tmp_path: Path) -> SqliteStore:
    s = SqliteStore(tmp_path / "test.db")
    yield s
    s.close()


def test_append_and_read_messages(store: SqliteStore) -> None:
    store.append_message("u1", "user", "hi")
    store.append_message("u1", "assistant", "hello")
    convo = store.get_conversation("u1")
    assert [m.role for m in convo.messages] == ["user", "assistant"]
    assert [m.content for m in convo.messages] == ["hi", "hello"]


def test_human_takeover_persists(store: SqliteStore, tmp_path: Path) -> None:
    store.append_message("u2", "user", "hey")
    store.set_human_takeover("u2", True)
    store.close()

    again = SqliteStore(tmp_path / "test.db")
    convo = again.get_conversation("u2")
    assert convo.human_takeover is True
    assert len(convo.messages) == 1
    again.close()


def test_leads_round_trip(store: SqliteStore) -> None:
    store.add_lead(
        Lead(
            sender_id="u3",
            kind="sell_device",
            summary="wants to sell iPhone 12",
            device="iPhone 12",
            contact="555-0100",
        )
    )
    convo = store.get_conversation("u3")
    assert len(convo.leads) == 1
    assert convo.leads[0].device == "iPhone 12"


def test_list_conversations_orders_by_recent(store: SqliteStore) -> None:
    store.append_message("old", "user", "old msg")
    store.append_message("new", "user", "newer msg")
    convos = store.list_conversations()
    assert [c["sender_id"] for c in convos[:2]] == ["new", "old"]
