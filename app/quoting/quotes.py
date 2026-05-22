from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path

DEFAULT_PRICE_BOOK_PATH = Path(__file__).resolve().parents[2] / "data" / "price_book.json"


@dataclass
class Quote:
    device: str
    issue: str
    price_low: float | None
    price_high: float | None
    turnaround: str | None
    notes: str
    confident: bool


def _normalize(text: str) -> str:
    """Lower-case, strip punctuation, collapse whitespace."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9 ]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


class QuoteBook:
    """JSON-backed price book.

    Drop-in compatible with the previous stub — same `lookup(device, issue)`
    contract. Edit `data/price_book.json` to change pricing.
    """

    def __init__(self, path: str | Path = DEFAULT_PRICE_BOOK_PATH) -> None:
        self.path = Path(path)
        self._load()

    def _load(self) -> None:
        raw = json.loads(self.path.read_text())
        self._aliases: dict[str, str] = {}
        for canonical, phrases in raw.get("issue_aliases", {}).items():
            self._aliases[canonical] = canonical
            for p in phrases:
                self._aliases[_normalize(p)] = canonical

        self._devices: dict[str, dict] = {}
        self._device_match: list[tuple[str, str]] = []  # (normalized_match, device_key)
        for key, dev in raw.get("devices", {}).items():
            self._devices[key] = dev
            for phrase in dev.get("match", []):
                self._device_match.append((_normalize(phrase), key))
        # Longer matches first so "iphone 13 pro" beats "iphone 13".
        self._device_match.sort(key=lambda x: len(x[0]), reverse=True)

    def _match_device(self, device_text: str) -> str | None:
        norm = _normalize(device_text)
        for phrase, key in self._device_match:
            if phrase in norm:
                return key
        return None

    def _match_issue(self, issue_text: str) -> str | None:
        norm = _normalize(issue_text)
        if norm in self._aliases:
            return self._aliases[norm]
        # Substring fallback so "my screen is cracked" matches the "screen" alias group.
        best: tuple[int, str] | None = None
        for phrase, canonical in self._aliases.items():
            if phrase and phrase in norm:
                if best is None or len(phrase) > best[0]:
                    best = (len(phrase), canonical)
        return best[1] if best else None

    def lookup(self, device: str, issue: str) -> Quote:
        device_key = self._match_device(device)
        issue_key = self._match_issue(issue)

        if device_key is None:
            return Quote(
                device=device,
                issue=issue,
                price_low=None,
                price_high=None,
                turnaround=None,
                notes=f"No price book entry for '{device}'. Needs a human quote.",
                confident=False,
            )

        dev = self._devices[device_key]
        if issue_key is None or issue_key not in dev["repairs"]:
            return Quote(
                device=dev["display"],
                issue=issue,
                price_low=None,
                price_high=None,
                turnaround=None,
                notes=f"We service the {dev['display']}, but I don't have a price for '{issue}'. A tech will follow up.",
                confident=False,
            )

        r = dev["repairs"][issue_key]
        return Quote(
            device=dev["display"],
            issue=issue_key,
            price_low=float(r["low"]),
            price_high=float(r["high"]),
            turnaround=r.get("turnaround"),
            notes="",
            confident=True,
        )


_book: QuoteBook | None = None


def get_quote_book() -> QuoteBook:
    global _book
    if _book is None:
        _book = QuoteBook()
    return _book


def reset_quote_book_singleton() -> None:
    global _book
    _book = None
