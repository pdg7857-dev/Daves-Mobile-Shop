from __future__ import annotations

import logging

from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, Request
from fastapi.responses import PlainTextResponse

from app.ai import get_engine
from app.ai.attachments import InboundAttachment
from app.config import get_settings
from app.messenger.send_api import SendAPI
from app.messenger.verify import verify_signature

log = logging.getLogger(__name__)

router = APIRouter(prefix="/webhook/messenger", tags=["messenger"])


@router.get("")
async def verify(request: Request) -> PlainTextResponse:
    """Meta calls this once when you set up the webhook subscription.

    Meta sends `hub.mode`, `hub.verify_token`, `hub.challenge` as query params.
    The dotted names can't be Python identifiers, so read them off the request.
    """
    qp = request.query_params
    settings = get_settings()
    if (
        qp.get("hub.mode") == "subscribe"
        and qp.get("hub.verify_token") == settings.messenger_verify_token
    ):
        return PlainTextResponse(qp.get("hub.challenge") or "")
    raise HTTPException(status_code=403, detail="verify token mismatch")


@router.post("")
async def receive(
    request: Request,
    background: BackgroundTasks,
    x_hub_signature_256: str | None = Header(default=None),
) -> dict:
    settings = get_settings()
    raw = await request.body()

    if settings.messenger_app_secret and not verify_signature(
        settings.messenger_app_secret, raw, x_hub_signature_256
    ):
        raise HTTPException(status_code=401, detail="bad signature")

    payload = await request.json()
    if payload.get("object") != "page":
        # Meta sends 404 expectations for non-page objects; ignore.
        return {"status": "ignored"}

    for entry in payload.get("entry", []):
        for event in entry.get("messaging", []):
            background.add_task(_handle_event, event)

    # Meta requires a 200 within 20 seconds; reply fast, do work in background.
    return {"status": "ok"}


async def _handle_event(event: dict) -> None:
    sender_id = event.get("sender", {}).get("id")
    message = event.get("message") or {}
    text = message.get("text") or ""

    attachments: list[InboundAttachment] = []
    for att in message.get("attachments") or []:
        if att.get("type") == "image":
            url = (att.get("payload") or {}).get("url")
            if url:
                attachments.append(InboundAttachment(kind="image", url=url))

    if not sender_id or (not text and not attachments):
        log.debug("skipping event with no text or images: %s", event)
        return

    send = SendAPI()
    await send.mark_seen(sender_id)

    engine = get_engine()
    reply = engine.handle_message(sender_id, text, attachments=attachments or None)
    if reply is None or not reply.text:
        return

    await send.send_text(sender_id, reply.text)
