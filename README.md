# Dave's Mobile Shop — Messenger AI

Framework for an AI assistant that handles Facebook Messenger conversations
for a mobile phone repair / sales / purchasing business.

## What's in here

- `app/messenger/` — Meta Messenger Platform webhook + Send API client. Handles text and image attachments.
- `app/ai/` — Claude-based reply engine with tool use (quote lookup, lead capture, handoff). Vision-capable: customer photos are forwarded to Claude.
- `app/intents/` — Cheap keyword intent classifier for logging/analytics.
- `app/quoting/` — JSON-backed price book (`data/price_book.json`) with device + issue alias matching.
- `app/inventory/` — JSON-backed used-device stock (`data/inventory.json`). The bot can search it and mark items reserved.
- `app/rate_limit.py` — Sliding-window per-sender rate limiter (defaults: 30 events / 5 minutes), with single-shot cooldown on the "slow down" reply.
- `app/storage/` — `Store` protocol with two implementations: `InMemoryStore` for tests and `SqliteStore` for prod.
- `app/admin/` — Tiny HTTP-Basic-auth dashboard at `/admin`: conversation list, transcripts, leads, and a "take over / resume bot" button.
- `app/config/` — Settings loaded from env vars.
- `scripts/cli_chat.py` — Local CLI simulator. Supports `/img <path>` to attach a photo.
- `data/price_book.json` — Edit this to set real prices and turnarounds.
- `tests/` — 38 tests covering intents, tools, quoting, signature verify, SQLite persistence, image handling, admin auth, and webhook routing.

## Quick start

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in ANTHROPIC_API_KEY at minimum

# Talk to the bot locally (no Meta needed):
python -m scripts.cli_chat
# Send a photo:  /img /path/to/damage.jpg my screen broke

# Run the webhook + admin server:
uvicorn app.main:app --reload --port 8000

# Run the tests:
pytest -q
```

## Admin dashboard

Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`, then visit
`http://localhost:8000/admin` and log in. Pages:

- **Conversations** — list + per-thread transcript, with a take-over/resume button.
- **Tickets** — repair tickets list, status dropdowns to advance (`received` → `diagnosing` → `in_progress` → `ready` → `picked_up`), and a "New ticket" form. The bot reads from this table when answering "is my repair ready?".
- **Leads** — every `capture_lead` / `reserve_sale` the bot has captured, with a `Export CSV` link (`/admin/leads.csv`).
- **Inventory** — current `data/inventory.json` contents (available + sold).

If `ADMIN_PASSWORD` is blank the dashboard returns 503 — it isn't open to anonymous users by accident.

## Wiring to Messenger

1. Create a Meta app, add the Messenger product, connect your Facebook Page.
2. Set the webhook callback URL to `https://<your-host>/webhook/messenger` and
   the verify token to whatever you put in `MESSENGER_VERIFY_TOKEN`.
3. Subscribe the page to `messages`, `messaging_postbacks`, `message_reads`.
4. Put the page access token in `MESSENGER_PAGE_ACCESS_TOKEN`.

## Design notes

- **Single entry point.** All inbound messages — Messenger or CLI — go through
  `app.ai.engine.Engine.handle_message`. That's where you add behavior; the
  channels just translate I/O.
- **Tool use, not prompt soup.** Quoting, inventory search, sale reservation,
  lead capture, and handoff are Claude tools (`app/ai/tools.py`), so the model
  decides when to invoke them rather than us trying to parse free text.
- **Real price book.** `data/price_book.json` is the source of truth for
  pricing. Add device variants under `devices` and add customer-phrasing
  alternatives under `issue_aliases`. The quote tool reports `confident: false`
  if either lookup misses, and the system prompt forbids inventing prices.
- **Handoff.** When the model calls the `request_human` tool, the conversation
  is flagged in the store and the bot stops auto-replying. Clear it from the
  admin dashboard (or `/handoff off` in the CLI).
- **Images.** Customer photos from Messenger are downloaded server-side and
  passed to Claude as base64 image blocks on the current turn only. The
  transcript persists a `[N photo(s) attached]` placeholder, not the bytes.
