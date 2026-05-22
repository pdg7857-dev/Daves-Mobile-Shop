from app.ai.tools import ToolRunner
from app.storage import InMemoryStore


def test_quote_repair_returns_priced_quote_for_known_device():
    runner = ToolRunner(InMemoryStore(), "user-1")
    result = runner.run("quote_repair", {"device": "iPhone 13", "issue": "cracked screen"})
    assert result["device"] == "iPhone 13"
    assert result["confident"] is True
    assert result["price_low"] is not None and result["price_high"] is not None


def test_quote_repair_unknown_device_is_not_confident():
    runner = ToolRunner(InMemoryStore(), "user-1b")
    result = runner.run("quote_repair", {"device": "Nokia 3310", "issue": "screen"})
    assert result["confident"] is False


def test_capture_lead_persists_to_store():
    store = InMemoryStore()
    runner = ToolRunner(store, "user-2")
    result = runner.run(
        "capture_lead",
        {
            "kind": "sell_device",
            "summary": "Wants to sell iPhone 12",
            "device": "iPhone 12",
            "contact": "555-1234",
        },
    )
    assert result["ok"] is True
    leads = store.get_conversation("user-2").leads
    assert len(leads) == 1
    assert leads[0].device == "iPhone 12"


def test_request_human_sets_takeover_flag():
    store = InMemoryStore()
    runner = ToolRunner(store, "user-3")
    result = runner.run("request_human", {"reason": "angry customer"})
    assert result["ok"] is True
    assert runner.handoff_requested is True
    assert store.get_conversation("user-3").human_takeover is True


def test_check_inventory_returns_matching_items():
    runner = ToolRunner(InMemoryStore(), "user-5")
    result = runner.run("check_inventory", {"model": "iPhone 13"})
    assert result["count"] >= 1
    assert all("iPhone 13" in it["model"] for it in result["items"])


def test_reserve_sale_marks_sold_and_captures_lead():
    from app.inventory import get_inventory
    from app.inventory.inventory import reset_inventory_singleton

    reset_inventory_singleton()
    inv = get_inventory()
    item = inv.list_all()[0]
    sku = item.sku

    store = InMemoryStore()
    runner = ToolRunner(store, "user-6")
    result = runner.run("reserve_sale", {"sku": sku, "contact": "555-9999"})
    assert result["ok"] is True
    assert result["sku"] == sku

    leads = store.get_conversation("user-6").leads
    assert len(leads) == 1
    assert leads[0].kind == "buy_device"
    assert leads[0].contact == "555-9999"

    # Restore inventory file so subsequent tests aren't affected.
    inv.mark_sold(sku)  # idempotent
    import json
    from app.inventory.inventory import DEFAULT_INVENTORY_PATH

    raw = json.loads(DEFAULT_INVENTORY_PATH.read_text())
    for row in raw["items"]:
        if row["sku"] == sku:
            row["sold"] = False
    DEFAULT_INVENTORY_PATH.write_text(json.dumps(raw, indent=2))
    reset_inventory_singleton()


def test_reserve_sale_unknown_sku():
    runner = ToolRunner(InMemoryStore(), "user-7")
    result = runner.run("reserve_sale", {"sku": "DOES-NOT-EXIST", "contact": "x"})
    assert result["ok"] is False


def test_unknown_tool():
    runner = ToolRunner(InMemoryStore(), "user-4")
    result = runner.run("nope", {})
    assert "error" in result
