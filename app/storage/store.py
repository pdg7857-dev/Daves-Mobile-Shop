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


_store: Store | None = None


def get_store() -> Store:
    global _store
    if _store is None:
        _store = InMemoryStore()
    return _store
