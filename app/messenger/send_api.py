from __future__ import annotations

import logging

import httpx

from app.config import get_settings

log = logging.getLogger(__name__)

GRAPH_URL = "https://graph.facebook.com/v19.0/me/messages"


class SendAPI:
    """Thin wrapper around Meta's Send API."""

    def __init__(self, page_access_token: str | None = None) -> None:
        self.token = page_access_token or get_settings().messenger_page_access_token

    async def send_text(self, recipient_id: str, text: str) -> None:
        if not self.token:
            log.warning("MESSENGER_PAGE_ACCESS_TOKEN not set; skipping send to %s", recipient_id)
            return
        payload = {
            "recipient": {"id": recipient_id},
            "messaging_type": "RESPONSE",
            "message": {"text": text},
        }
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(
                GRAPH_URL,
                params={"access_token": self.token},
                json=payload,
            )
            if r.status_code >= 400:
                log.error("send_text failed: %s %s", r.status_code, r.text)
            r.raise_for_status()

    async def mark_seen(self, recipient_id: str) -> None:
        if not self.token:
            return
        payload = {
            "recipient": {"id": recipient_id},
            "sender_action": "mark_seen",
        }
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(GRAPH_URL, params={"access_token": self.token}, json=payload)
