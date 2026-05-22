"""Local Messenger simulator.

Lets you iterate on the bot's behavior without setting up Meta. Each line you
type is sent through the same `Engine.handle_message` path the webhook uses.

Usage:
    python -m scripts.cli_chat

Type `/reset` to start a new conversation, `/handoff off` to clear human takeover
after the bot escalates, and Ctrl-D to quit.
"""
from __future__ import annotations

import sys

from app.ai import get_engine
from app.ai.attachments import from_local_path
from app.storage import get_store


def main() -> int:
    engine = get_engine()
    store = get_store()
    sender_id = "cli-local"

    print(
        "Dave's Mobile Shop — local chat. Ctrl-D to quit. /reset to clear history. "
        "Prefix a line with `/img <path> ` to send an image attachment."
    )
    while True:
        try:
            line = input("you> ").strip()
        except EOFError:
            print()
            return 0

        if not line:
            continue
        if line == "/reset":
            store.set_human_takeover(sender_id, False)
            print("(history cleared — note: with sqlite store, messages persist on disk)")
            continue
        if line == "/handoff off":
            store.set_human_takeover(sender_id, False)
            print("(human takeover cleared)")
            continue

        attachments = []
        text = line
        if line.startswith("/img "):
            rest = line[len("/img "):].strip()
            parts = rest.split(" ", 1)
            img_path = parts[0]
            text = parts[1] if len(parts) > 1 else ""
            try:
                attachments.append(from_local_path(img_path))
            except (FileNotFoundError, ValueError) as exc:
                print(f"(image error: {exc})")
                continue

        reply = engine.handle_message(sender_id, text, attachments=attachments or None)
        if reply is None:
            print("bot> (silent — conversation is in human takeover)")
            continue
        tag = f"[intent={reply.intent.value}"
        if reply.tools_used:
            tag += f" tools={','.join(reply.tools_used)}"
        if reply.handoff:
            tag += " HANDOFF"
        tag += "]"
        print(f"bot> {reply.text}  {tag}")


if __name__ == "__main__":
    sys.exit(main())
