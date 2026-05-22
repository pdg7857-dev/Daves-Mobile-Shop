from app.ai.tools import ToolRunner
from app.storage import InMemoryStore


def test_quote_repair_returns_stub_quote():
    runner = ToolRunner(InMemoryStore(), "user-1")
    result = runner.run("quote_repair", {"device": "iPhone 13", "issue": "cracked screen"})
    assert result["device"] == "iPhone 13"
    assert result["confident"] is False  # stub data


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


def test_unknown_tool():
    runner = ToolRunner(InMemoryStore(), "user-4")
    result = runner.run("nope", {})
    assert "error" in result
