from __future__ import annotations

from enum import Enum


class Intent(str, Enum):
    REPAIR_QUOTE = "repair_quote"
    BUY_DEVICE = "buy_device"
    SELL_DEVICE = "sell_device"
    STATUS_CHECK = "status_check"
    HOURS_LOCATION = "hours_location"
    OTHER = "other"


_KEYWORDS: dict[Intent, tuple[str, ...]] = {
    Intent.REPAIR_QUOTE: (
        "repair", "fix", "broken", "cracked", "screen", "battery",
        "charging port", "water damage", "quote", "how much",
    ),
    Intent.BUY_DEVICE: (
        "buy", "for sale", "available", "in stock", "do you have",
        "looking for a", "any iphone", "any samsung",
    ),
    Intent.SELL_DEVICE: (
        "sell my", "trade in", "what would you give", "buy my",
        "selling my", "i want to sell",
    ),
    Intent.STATUS_CHECK: (
        "ready", "is it done", "ticket", "order status", "pickup",
    ),
    Intent.HOURS_LOCATION: (
        "hours", "open", "closed", "address", "where are you", "location",
    ),
}


def classify(text: str) -> Intent:
    """Cheap keyword router.

    The LLM is the real intent engine — this exists for logging, analytics,
    and to short-circuit obvious cases (hours, status) without a model call.
    """
    t = text.lower()
    for intent, kws in _KEYWORDS.items():
        if any(kw in t for kw in kws):
            return intent
    return Intent.OTHER
