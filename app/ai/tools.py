from __future__ import annotations

from dataclasses import asdict
from typing import Any

from app.inventory import get_inventory
from app.inventory.inventory import item_to_dict
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
        "name": "check_inventory",
        "description": (
            "Search the used-device inventory for phones we have in stock. "
            "Call this whenever a customer asks if you have a specific model. "
            "Returns matching items with price, storage, color, and condition. "
            "Do not list devices that aren't in the result."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "model": {
                    "type": "string",
                    "description": "Model the customer asked about, e.g. 'iPhone 13', 'Galaxy S22'.",
                },
                "max_price": {
                    "type": "number",
                    "description": "Optional ceiling — only return items at or below this price.",
                },
            },
            "required": ["model"],
        },
    },
    {
        "name": "reserve_sale",
        "description": (
            "Mark an inventory item as sold/reserved for a customer once they've "
            "committed to buying it AND given a contact phone/email. Use the exact "
            "`sku` from `check_inventory`. After calling this, tell the customer "
            "we'll hold it and someone will follow up to arrange payment/pickup."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "sku": {"type": "string"},
                "contact": {
                    "type": "string",
                    "description": "Phone or email the customer gave you.",
                },
            },
            "required": ["sku", "contact"],
        },
    },
    {
        "name": "lookup_ticket",
        "description": (
            "Look up a customer's repair ticket(s) so you can tell them the "
            "status (received, diagnosing, in_progress, ready, picked_up). "
            "Search by phone number, email, name, or ticket id. Ask the "
            "customer for a phone number or ticket id before calling this. "
            "Do not invent a status for tickets that aren't returned."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": (
                        "Phone number (any format — digits will be extracted), "
                        "email, customer name, or ticket id (with or without #)."
                    ),
                },
            },
            "required": ["query"],
        },
    },
    {
        "name": "propose_quick_replies",
        "description": (
            "Attach up to 4 short tappable reply buttons (Messenger quick replies) "
            "to your next response. Use for clear yes/no questions or short option "
            "lists (e.g. ['iPhone', 'Samsung', 'Other']). Don't use for free-form "
            "questions. Each option must be 20 characters or fewer."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "options": {
                    "type": "array",
                    "items": {"type": "string"},
                    "minItems": 1,
                    "maxItems": 4,
                },
            },
            "required": ["options"],
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
        self.quick_replies: list[str] = []

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

        if name == "check_inventory":
            items = get_inventory().search(
                args["model"], max_price=args.get("max_price")
            )
            return {"count": len(items), "items": [item_to_dict(i) for i in items]}

        if name == "reserve_sale":
            inv = get_inventory()
            item = inv.mark_sold(args["sku"])
            if item is None:
                return {"ok": False, "error": f"unknown sku: {args['sku']}"}
            self.store.add_lead(
                Lead(
                    sender_id=self.sender_id,
                    kind="buy_device",
                    summary=f"Reserved {item.model} ({item.sku}) for ${item.price:.0f}",
                    device=item.model,
                    contact=args.get("contact"),
                )
            )
            return {"ok": True, "sku": item.sku, "price": item.price, "model": item.model}

        if name == "lookup_ticket":
            tickets = self.store.find_tickets(args["query"])
            return {
                "count": len(tickets),
                "tickets": [
                    {
                        "id": t.id,
                        "customer_name": t.customer_name,
                        "device": t.device,
                        "issue": t.issue,
                        "status": t.status,
                        "notes": t.notes,
                    }
                    for t in tickets
                ],
            }

        if name == "propose_quick_replies":
            opts = [str(o)[:20] for o in (args.get("options") or [])][:4]
            self.quick_replies = opts
            return {"ok": True, "set": opts}

        if name == "request_human":
            self.store.set_human_takeover(self.sender_id, True)
            self.handoff_requested = True
            return {"ok": True, "reason": args.get("reason", "")}

        return {"error": f"unknown tool: {name}"}
