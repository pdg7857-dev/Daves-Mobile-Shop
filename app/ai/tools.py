from __future__ import annotations

from dataclasses import asdict
from typing import Any

from app.quoting import get_quote_book
from app.storage import Lead, Store

TOOL_DEFS: list[dict[str, Any]] = [
    {
        "name": "quote_repair",
        "description": (
            "Look up a repair price for a given device model and issue. "
            "Call this any time the customer asks how much a repair will cost. "
            "If the result is not confident, do NOT invent a number — tell the "
            "customer a tech will follow up with the exact price."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "device": {
                    "type": "string",
                    "description": "Device model as stated, e.g. 'iPhone 13 Pro', 'Galaxy S22'.",
                },
                "issue": {
                    "type": "string",
                    "description": "Short description of the problem, e.g. 'cracked screen', 'battery replacement'.",
                },
            },
            "required": ["device", "issue"],
        },
    },
    {
        "name": "capture_lead",
        "description": (
            "Record a sales or purchasing lead so staff can follow up. "
            "Use when the customer wants to buy a phone, sell/trade in a phone, "
            "or needs a repair you couldn't price."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "kind": {
                    "type": "string",
                    "enum": ["repair_quote", "buy_device", "sell_device", "other"],
                },
                "summary": {
                    "type": "string",
                    "description": "One-sentence summary of what the customer wants.",
                },
                "device": {"type": "string"},
                "issue": {"type": "string"},
                "contact": {
                    "type": "string",
                    "description": "Phone or email if the customer provided one.",
                },
            },
            "required": ["kind", "summary"],
        },
    },
    {
        "name": "request_human",
        "description": (
            "Hand the conversation off to a human staff member. Use for upset "
            "customers, complex disputes, requests outside repair/sales/purchasing, "
            "or anything you're unsure about. After calling this you must tell the "
            "customer a human will reply shortly."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "reason": {"type": "string"},
            },
            "required": ["reason"],
        },
    },
]


class ToolRunner:
    """Executes tool calls produced by the model and returns JSON-serializable results."""

    def __init__(self, store: Store, sender_id: str) -> None:
        self.store = store
        self.sender_id = sender_id
        self.handoff_requested = False

    def run(self, name: str, args: dict[str, Any]) -> dict[str, Any]:
        if name == "quote_repair":
            quote = get_quote_book().lookup(args["device"], args["issue"])
            return asdict(quote)

        if name == "capture_lead":
            lead = Lead(
                sender_id=self.sender_id,
                kind=args["kind"],
                summary=args["summary"],
                device=args.get("device"),
                issue=args.get("issue"),
                contact=args.get("contact"),
            )
            self.store.add_lead(lead)
            return {"ok": True, "lead_id": f"{self.sender_id}:{int(lead.ts)}"}

        if name == "request_human":
            self.store.set_human_takeover(self.sender_id, True)
            self.handoff_requested = True
            return {"ok": True, "reason": args.get("reason", "")}

        return {"error": f"unknown tool: {name}"}
