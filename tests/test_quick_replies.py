from dataclasses import dataclass, field
from typing import Any

import pytest

from app.ai.tools import ToolRunner
from app.messenger.send_api import SendAPI
from app.storage import InMemoryStore


@dataclass
class _MockResponse:
    status_code: int = 200
    text: str = "ok"

    def raise_for_status(self) -> None:
        pass


@dataclass
class _MockClient:
    calls: list[dict[str, Any]] = field(default_factory=list)

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_):
        return None

    async def post(self, url: str, params: dict | None = None, json: dict | None = None):
        self.calls.append({"json": json})
        return _MockResponse()


@pytest.fixture()
def mock_httpx(monkeypatch):
    holder: dict[str, _MockClient] = {}

    def factory(*_a, **_k):
        client = _MockClient()
        holder["client"] = client
        return client

    monkeypatch.setattr("app.messenger.send_api.httpx.AsyncClient", factory)
    return holder


def test_propose_quick_replies_sets_runner_state():
    runner = ToolRunner(InMemoryStore(), "u-1")
    result = runner.run("propose_quick_replies", {"options": ["Yes", "No", "Tell me more"]})
    assert result["ok"] is True
    assert runner.quick_replies == ["Yes", "No", "Tell me more"]


def test_propose_quick_replies_truncates_long_titles():
    runner = ToolRunner(InMemoryStore(), "u-1")
    result = runner.run(
        "propose_quick_replies",
        {"options": ["a" * 30, "ok"]},
    )
    assert len(result["set"][0]) == 20


def test_propose_quick_replies_caps_at_four():
    runner = ToolRunner(InMemoryStore(), "u-1")
    runner.run("propose_quick_replies", {"options": ["a", "b", "c", "d", "e", "f"]})
    assert len(runner.quick_replies) == 4


@pytest.mark.asyncio
async def test_send_text_includes_quick_replies(mock_httpx):
    api = SendAPI(page_access_token="tok")
    await api.send_text("u-1", "Pick one", quick_replies=["Yes", "No"])
    payload = mock_httpx["client"].calls[0]["json"]
    qr = payload["message"]["quick_replies"]
    assert [q["title"] for q in qr] == ["Yes", "No"]
    assert all(q["content_type"] == "text" for q in qr)


@pytest.mark.asyncio
async def test_send_text_omits_quick_replies_field_when_empty(mock_httpx):
    api = SendAPI(page_access_token="tok")
    await api.send_text("u-1", "hello")
    payload = mock_httpx["client"].calls[0]["json"]
    assert "quick_replies" not in payload["message"]
