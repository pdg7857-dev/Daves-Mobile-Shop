from __future__ import annotations

import base64
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import httpx

log = logging.getLogger(__name__)

SUPPORTED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5MB — well under Claude's 5MB per-image limit


@dataclass
class InboundAttachment:
    """An image attached to an inbound message.

    Provide either `url` (we'll fetch it) or `data_b64` + `media_type` (already in hand).
    """

    kind: str = "image"
    url: str | None = None
    media_type: str | None = None
    data_b64: str | None = None


def from_local_path(path: str | Path) -> InboundAttachment:
    p = Path(path)
    suffix = p.suffix.lower()
    media_type = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
    }.get(suffix)
    if media_type is None:
        raise ValueError(f"unsupported image extension: {suffix}")
    data = p.read_bytes()
    if len(data) > MAX_IMAGE_BYTES:
        raise ValueError(f"image too large: {len(data)} bytes")
    return InboundAttachment(
        kind="image",
        media_type=media_type,
        data_b64=base64.standard_b64encode(data).decode("ascii"),
    )


def to_claude_block(att: InboundAttachment) -> dict[str, Any] | None:
    """Convert an attachment to a Claude image content block, downloading if needed."""
    if att.kind != "image":
        return None

    if not att.data_b64 and att.url:
        downloaded = _download(att.url)
        if downloaded is None:
            return None
        media_type, data_b64 = downloaded
        att.media_type = media_type
        att.data_b64 = data_b64

    if not att.data_b64 or not att.media_type:
        return None
    if att.media_type not in SUPPORTED_IMAGE_TYPES:
        log.warning("unsupported media type from Messenger: %s", att.media_type)
        return None

    return {
        "type": "image",
        "source": {
            "type": "base64",
            "media_type": att.media_type,
            "data": att.data_b64,
        },
    }


def _download(url: str) -> tuple[str, str] | None:
    try:
        with httpx.Client(timeout=15, follow_redirects=True) as c:
            r = c.get(url)
            r.raise_for_status()
    except httpx.HTTPError as exc:
        log.error("failed to download attachment %s: %s", url, exc)
        return None

    media_type = (r.headers.get("content-type") or "").split(";")[0].strip().lower()
    if media_type not in SUPPORTED_IMAGE_TYPES:
        log.warning("attachment at %s has unsupported content-type %s", url, media_type)
        return None
    if len(r.content) > MAX_IMAGE_BYTES:
        log.warning("attachment at %s too large (%d bytes)", url, len(r.content))
        return None

    return media_type, base64.standard_b64encode(r.content).decode("ascii")
