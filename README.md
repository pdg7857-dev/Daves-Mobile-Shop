# Dave's Mobile Shop — Messenger AI

Framework for an AI assistant that handles Facebook Messenger conversations
for a mobile phone repair / sales / purchasing business.

## What's in here

- `app/messenger/` — Meta Messenger Platform webhook + Send API client.
- `app/ai/` — Claude-based reply engine with tool use (quote lookup, lead capture, handoff).
- `app/intents/` — Intent classifier (repair quote, buy device, sell device, status check, other).
- `app/quoting/` — Pricing/quote logic. Currently stubbed; swap in real data when ready.
- `app/storage/` — In-memory conversation + lead store with a `Store` protocol so a real DB drops in later.
- `app/config/` — Settings loaded from env vars.
- `scripts/cli_chat.py` — Local CLI simulator so you can iterate on the AI without Meta in the loop.
- `tests/` — Smoke tests for the routing and tool layer.

## Quick start

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in ANTHROPIC_API_KEY at minimum

# Talk to the bot locally (no Meta needed):
python -m scripts.cli_chat

# Run the webhook server:
uvicorn app.main:app --reload --port 8000
```

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
- **Tool use, not prompt soup.** Quoting, lead capture, and handoff are Claude
  tools (`app/ai/tools.py`), so the model decides when to invoke them rather
  than us trying to parse free text.
- **Stub pricing.** `app/quoting/quotes.py` returns plausible numbers from a
  small in-memory table. Replace `QuoteBook` with a real source when ready.
- **Handoff.** When the model calls the `request_human` tool, the conversation
  is flagged in the store and the bot stops auto-replying until cleared.
