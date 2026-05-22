from __future__ import annotations

import json
import re
import threading
from dataclasses import asdict, dataclass
from pathlib import Path

DEFAULT_INVENTORY_PATH = Path(__file__).resolve().parents[2] / "data" / "inventory.json"


@dataclass
class InventoryItem:
    sku: str
    model: str
    color: str
    storage_gb: int
    condition: str
    price: float
    warranty_days: int
    sold: bool

    def summary(self) -> str:
        return (
            f"{self.model} {self.storage_gb}GB {self.color} — {self.condition}. "
            f"${self.price:.0f}, {self.warranty_days}-day warranty."
        )


def _normalize(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9 ]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


class Inventory:
    """File-backed used-device inventory.

    Writes go through a lock and re-persist the whole file — fine for shop-scale
    volume; swap for a DB if you outgrow it.
    """

    def __init__(self, path: str | Path = DEFAULT_INVENTORY_PATH) -> None:
        self.path = Path(path)
        self._lock = threading.Lock()
        self._load()

    def _load(self) -> None:
        raw = json.loads(self.path.read_text())
        self._raw = raw
        items: list[InventoryItem] = []
        self._matches: list[tuple[str, str]] = []  # (normalized phrase, sku)
        for row in raw.get("items", []):
            item = InventoryItem(
                sku=row["sku"],
                model=row["model"],
                color=row.get("color", ""),
                storage_gb=int(row.get("storage_gb", 0)),
                condition=row.get("condition", ""),
                price=float(row["price"]),
                warranty_days=int(row.get("warranty_days", 0)),
                sold=bool(row.get("sold", False)),
            )
            items.append(item)
            for phrase in row.get("match", []) + [row["model"]]:
                self._matches.append((_normalize(phrase), item.sku))
        # Group skus by phrase so all items sharing one phrase are returned together.
        by_phrase: dict[str, list[str]] = {}
        for phrase, sku in self._matches:
            by_phrase.setdefault(phrase, [])
            if sku not in by_phrase[phrase]:
                by_phrase[phrase].append(sku)
        # Longest phrase first so "iphone 13 pro" wins over "iphone 13".
        self._phrase_groups: list[tuple[str, list[str]]] = sorted(
            by_phrase.items(), key=lambda kv: len(kv[0]), reverse=True
        )
        self._items: dict[str, InventoryItem] = {it.sku: it for it in items}

    def reload(self) -> None:
        with self._lock:
            self._load()

    def search(
        self,
        model_query: str,
        *,
        max_price: float | None = None,
        include_sold: bool = False,
    ) -> list[InventoryItem]:
        norm = _normalize(model_query)
        if not norm:
            return []
        matched_skus: list[str] = []
        seen: set[str] = set()
        # Walk phrase groups longest-first and consume the span when one matches,
        # so "iphone 13 pro" wins over "iphone 13" but both variants of the
        # same model still come back together.
        remaining = norm
        for phrase, skus in self._phrase_groups:
            if phrase and phrase in remaining:
                for sku in skus:
                    if sku not in seen:
                        matched_skus.append(sku)
                        seen.add(sku)
                remaining = remaining.replace(phrase, " ")

        results: list[InventoryItem] = []
        for sku in matched_skus:
            item = self._items[sku]
            if not include_sold and item.sold:
                continue
            if max_price is not None and item.price > max_price:
                continue
            results.append(item)
        results.sort(key=lambda it: it.price)
        return results

    def mark_sold(self, sku: str) -> InventoryItem | None:
        with self._lock:
            item = self._items.get(sku)
            if item is None or item.sold:
                return item
            item.sold = True
            # Update the raw row too and persist.
            for row in self._raw.get("items", []):
                if row["sku"] == sku:
                    row["sold"] = True
                    break
            self.path.write_text(json.dumps(self._raw, indent=2))
            return item

    def list_all(self, include_sold: bool = False) -> list[InventoryItem]:
        items = list(self._items.values())
        if not include_sold:
            items = [it for it in items if not it.sold]
        items.sort(key=lambda it: (it.sold, it.model, it.price))
        return items


_inv: Inventory | None = None


def get_inventory() -> Inventory:
    global _inv
    if _inv is None:
        _inv = Inventory()
    return _inv


def reset_inventory_singleton() -> None:
    global _inv
    _inv = None


def item_to_dict(item: InventoryItem) -> dict:
    return asdict(item)
