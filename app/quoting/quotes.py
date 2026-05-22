from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Quote:
    device: str
    issue: str
    price_low: float | None
    price_high: float | None
    turnaround: str | None
    notes: str
    confident: bool


class QuoteBook:
    """Stub quote source.

    Replace this with a real price book (DB, sheet, API) without changing
    callers — the tool layer only depends on the `lookup` signature.
    """

    def lookup(self, device: str, issue: str) -> Quote:
        # Caller is responsible for normalizing; we still lower-case here so
        # the stub matches a few obvious examples for local testing.
        d = device.lower()
        i = issue.lower()
        if "screen" in i or "display" in i or "glass" in i:
            return Quote(
                device=device,
                issue=issue,
                price_low=None,
                price_high=None,
                turnaround="usually same-day",
                notes="Stub price book — wire real pricing before quoting customers.",
                confident=False,
            )
        if "battery" in i:
            return Quote(
                device=device,
                issue=issue,
                price_low=None,
                price_high=None,
                turnaround="usually 1 hour",
                notes="Stub price book — wire real pricing before quoting customers.",
                confident=False,
            )
        return Quote(
            device=device,
            issue=issue,
            price_low=None,
            price_high=None,
            turnaround=None,
            notes=f"No stub entry for device='{d}', issue='{i}'. Needs human quote.",
            confident=False,
        )


_book: QuoteBook | None = None


def get_quote_book() -> QuoteBook:
    global _book
    if _book is None:
        _book = QuoteBook()
    return _book
