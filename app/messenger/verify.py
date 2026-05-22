from __future__ import annotations

import hashlib
import hmac


def verify_signature(app_secret: str, raw_body: bytes, header_value: str | None) -> bool:
    """Validate Meta's X-Hub-Signature-256 header.

    Returns False on any mismatch or missing input. The webhook should reject
    requests that don't pass this check when an app secret is configured.
    """
    if not app_secret or not header_value:
        return False
    if not header_value.startswith("sha256="):
        return False
    expected = hmac.new(app_secret.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, header_value.removeprefix("sha256="))
