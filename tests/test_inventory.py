import json
from pathlib import Path

import pytest

from app.inventory import Inventory


@pytest.fixture()
def inv(tmp_path: Path) -> Inventory:
    data = {
        "items": [
            {
                "sku": "A1",
                "model": "iPhone 13",
                "match": ["iphone 13"],
                "color": "Pink",
                "storage_gb": 128,
                "condition": "Excellent",
                "price": 429,
                "warranty_days": 30,
                "sold": False,
            },
            {
                "sku": "A2",
                "model": "iPhone 13",
                "match": ["iphone 13"],
                "color": "Midnight",
                "storage_gb": 256,
                "condition": "Good",
                "price": 459,
                "warranty_days": 30,
                "sold": False,
            },
            {
                "sku": "A3",
                "model": "iPhone 13 Pro",
                "match": ["iphone 13 pro"],
                "color": "Graphite",
                "storage_gb": 256,
                "condition": "Excellent",
                "price": 599,
                "warranty_days": 30,
                "sold": False,
            },
            {
                "sku": "Z9",
                "model": "iPhone 11",
                "match": ["iphone 11"],
                "color": "Black",
                "storage_gb": 64,
                "condition": "Fair",
                "price": 199,
                "warranty_days": 30,
                "sold": True,
            },
        ]
    }
    p = tmp_path / "inventory.json"
    p.write_text(json.dumps(data))
    return Inventory(p)


def test_search_matches_base_model_not_pro(inv: Inventory):
    results = inv.search("iPhone 13")
    skus = [it.sku for it in results]
    assert "A1" in skus and "A2" in skus
    assert "A3" not in skus  # "iPhone 13 Pro" is its own phrase


def test_search_matches_pro_variant_explicitly(inv: Inventory):
    results = inv.search("looking for an iPhone 13 Pro")
    assert [it.sku for it in results] == ["A3"]


def test_search_max_price_filter(inv: Inventory):
    results = inv.search("iPhone 13", max_price=450)
    assert [it.sku for it in results] == ["A1"]


def test_search_excludes_sold(inv: Inventory):
    results = inv.search("iPhone 11")
    assert results == []
    with_sold = inv.search("iPhone 11", include_sold=True)
    assert [it.sku for it in with_sold] == ["Z9"]


def test_mark_sold_persists(inv: Inventory, tmp_path: Path):
    item = inv.mark_sold("A1")
    assert item is not None and item.sold is True
    raw = json.loads((tmp_path / "inventory.json").read_text())
    a1 = next(r for r in raw["items"] if r["sku"] == "A1")
    assert a1["sold"] is True


def test_mark_sold_unknown_sku(inv: Inventory):
    assert inv.mark_sold("nope") is None
