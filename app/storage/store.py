from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Protocol


@dataclass
class Message:
    role: str  # "user" | "assistant"
    content: str
    ts: float = field(default_factory=time.time)


@dataclass
class Lead:
    """A captured customer intent worth a human follow-up."""

    sender_id: str
    kind: str  # "repair_quote" | "buy_device" | "sell_device" | "other"
    summary: str
    device: str | None = None
    issue: str | None = None
    contact: str | None = None
    ts: float = field(default_factory=time.time)


@dataclass
class Conversation:
    sender_id: str
    messages: list[Message] = field(default_factory=list)
    human_takeover: bool = False
    leads: list[Lead] = field(default_factory=list)

    def history_for_model(self, limit: int = 20) -> list[dict]:
        return [{"role": m.role, "content": m.content} for m in self.messages[-limit:]]


class Store(Protocol):
    def get_conversation(self, sender_id: str) -> Conversation: ...
    def append_message(self, sender_id: str, role: str, content: str) -> None: ...
    def set_human_takeover(self, sender_id: str, on: bool) -> None: ...
    def add_lead(self, lead: Lead) -> None: ...


class InMemoryStore:
    """Process-local store. Fine for dev; swap for a DB-backed Store in prod."""

    def __init__(self) -> None:
        self._conversations: dict[str, Conversation] = {}

    def get_conversation(self, sender_id: str) -> Conversation:
        convo = self._conversations.get(sender_id)
        if convo is None:
            convo = Conversation(sender_id=sender_id)
            self._conversations[sender_id] = convo
        return convo

    def append_message(self, sender_id: str, role: str, content: str) -> None:
        self.get_conversation(sender_id).messages.append(Message(role=role, content=content))

    def set_human_takeover(self, sender_id: str, on: bool) -> None:
        self.get_conversation(sender_id).human_takeover = on

    def add_lead(self, lead: Lead) -> None:
        self.get_conversation(lead.sender_id).leads.append(lead)

    def list_conversations(self) -> list[dict]:
        out = []
        for sender_id, convo in self._conversations.items():
            last_ts = convo.messages[-1].ts if convo.messages else 0.0
            out.append(
                {
                    "sender_id": sender_id,
                    "human_takeover": int(convo.human_takeover),
                    "msg_count": len(convo.messages),
                    "last_msg_ts": last_ts,
                    "lead_count": len(convo.leads),
                }
            )
        out.sort(key=lambda r: r["last_msg_ts"], reverse=True)
        return out

    def list_leads(self) -> list[dict]:
        rows = []
        for convo in self._conversations.values():
            for lead in convo.leads:
                rows.append(
                    {
                        "sender_id": lead.sender_id,
                        "kind": lead.kind,
                        "summary": lead.summary,
                        "device": lead.device,
                        "issue": lead.issue,
                        "contact": lead.contact,
                        "ts": lead.ts,
                    }
                )
        rows.sort(key=lambda r: r["ts"], reverse=True)
        return rows


_store: Store | None = None


def get_store() -> Store:
    global _store
    if _store is None:
        from app.config import get_settings

        settings = get_settings()
        if settings.store_backend == "sqlite":
            from app.storage.sqlite_store import SqliteStore

            _store = SqliteStore(settings.db_path)
        else:
            _store = InMemoryStore()
    return _store


def reset_store_singleton() -> None:
    """For tests — clears the cached store so the next get_store() rebuilds it."""
    global _store
    _store = None
