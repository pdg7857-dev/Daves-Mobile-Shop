from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import pytest

from app.messenger.send_api import SendAPI


@dataclass
class _MockResponse:
    status_code: int = 200
    text: str = "ok"

    def raise_for_status(self) -> None:
        if self.status_code >= 400:
            raise AssertionError(f"http {self.status_code}: {self.text}")


@dataclass
class _MockClient:
    calls: list[dict[str, Any]] = field(default_factory=list)
    status: int = 200

    async def __aenter__(self) -> "_MockClient":
        return self

    async def __aexit__(self, *_: Any) -> None:
        return None

    async def post(self, url: str, params: dict | None = None, json: dict | None = None) -> _MockResponse:
        self.calls.append({"url": url, "params": params, "json": json})
        return _MockResponse(status_code=self.status)


@pytest.fixture()
def mock_httpx(monkeypatch):
    holder: dict[str, _MockClient] = {}

    def factory(*_args, **_kwargs) -> _MockClient:
        client = _MockClient()
        holder["client"] = client
        return client

    monkeypatch.setattr("app.messenger.send_api.httpx.AsyncClient", factory)
    return holder


@pytest.mark.asyncio
async def test_send_text_posts_to_graph_url(mock_httpx):
    api = SendAPI(page_access_token="test-token")
    await api.send_text("user-123", "hello there")
    call = mock_httpx["client"].calls[0]
    assert call["url"].endswith("/me/messages")
    assert call["params"] == {"access_token": "test-token"}
    assert call["json"]["recipient"] == {"id": "user-123"}
    assert call["json"]["message"] == {"text": "hello there"}
    assert call["json"]["messaging_type"] == "RESPONSE"


@pytest.mark.asyncio
async def test_send_text_skips_without_token(mock_httpx, caplog):
    api = SendAPI(page_access_token="")
    await api.send_text("user-123", "hello")
    assert "client" not in mock_httpx  # client was never constructed


@pytest.mark.asyncio
async def test_mark_seen_posts_sender_action(mock_httpx):
    api = SendAPI(page_access_token="test-token")
    await api.mark_seen("user-9")
    call = mock_httpx["client"].calls[0]
    assert call["json"] == {"recipient": {"id": "user-9"}, "sender_action": "mark_seen"}
