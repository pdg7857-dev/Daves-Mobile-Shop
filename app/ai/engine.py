from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from typing import Any

from anthropic import Anthropic

from app.ai.attachments import InboundAttachment, to_claude_block
from app.ai.prompts import system_prompt
from app.ai.tools import TOOL_DEFS, ToolRunner
from app.config import get_settings
from app.intents import Intent, classify
from app.storage import Store, get_store

log = logging.getLogger(__name__)

MAX_TOOL_ITERATIONS = 5


@dataclass
class Reply:
    text: str
    intent: Intent
    handoff: bool
    tools_used: list[str]


class Engine:
    """Channel-agnostic reply engine. Both Messenger and the CLI go through this."""

    def __init__(self, store: Store | None = None, client: Anthropic | None = None) -> None:
        self.settings = get_settings()
        self.store = store or get_store()
        self.client = client or Anthropic(api_key=self.settings.anthropic_api_key)

    def handle_message(
        self,
        sender_id: str,
        text: str,
        attachments: list[InboundAttachment] | None = None,
    ) -> Reply | None:
        convo = self.store.get_conversation(sender_id)
        if convo.human_takeover:
            log.info("conversation %s in human takeover; skipping AI reply", sender_id)
            return None

        intent = classify(text)

        # Persist a text-only record of this turn. Image bytes don't get stored —
        # we just note that photos came in so the transcript still reads naturally.
        persisted = text or ""
        if attachments:
            tag = f"[{len(attachments)} photo(s) attached]"
            persisted = f"{persisted}\n{tag}".strip() if persisted else tag
        self.store.append_message(sender_id, "user", persisted)

        runner = ToolRunner(self.store, sender_id)
        history = self.store.get_conversation(sender_id).history_for_model()

        if attachments:
            image_blocks = [b for b in (to_claude_block(a) for a in attachments) if b]
            if image_blocks:
                history[-1] = {
                    "role": "user",
                    "content": [
                        *image_blocks,
                        {"type": "text", "text": text or "(customer sent a photo)"},
                    ],
                }

        final_text, tools_used = self._run_with_tools(history, runner)
        self.store.append_message(sender_id, "assistant", final_text)

        return Reply(
            text=final_text,
            intent=intent,
            handoff=runner.handoff_requested,
            tools_used=tools_used,
        )

    def _run_with_tools(self, history: list[dict], runner: ToolRunner) -> tuple[str, list[str]]:
        messages: list[dict[str, Any]] = list(history)
        tools_used: list[str] = []

        for _ in range(MAX_TOOL_ITERATIONS):
            response = self.client.messages.create(
                model=self.settings.bot_model,
                max_tokens=self.settings.bot_max_tokens,
                system=system_prompt(),
                tools=TOOL_DEFS,
                messages=messages,
            )

            if response.stop_reason != "tool_use":
                return _text_of(response), tools_used

            assistant_blocks: list[dict[str, Any]] = []
            tool_results: list[dict[str, Any]] = []
            for block in response.content:
                btype = getattr(block, "type", None)
                if btype == "text":
                    assistant_blocks.append({"type": "text", "text": block.text})
                elif btype == "tool_use":
                    assistant_blocks.append(
                        {
                            "type": "tool_use",
                            "id": block.id,
                            "name": block.name,
                            "input": block.input,
                        }
                    )
                    tools_used.append(block.name)
                    result = runner.run(block.name, block.input or {})
                    tool_results.append(
                        {
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": json.dumps(result),
                        }
                    )

            messages.append({"role": "assistant", "content": assistant_blocks})
            messages.append({"role": "user", "content": tool_results})

        log.warning("hit MAX_TOOL_ITERATIONS without a final text reply")
        return (
            "Sorry, I'm having trouble with that one — a human will follow up shortly.",
            tools_used,
        )


def _text_of(response: Any) -> str:
    parts: list[str] = []
    for block in response.content:
        if getattr(block, "type", None) == "text":
            parts.append(block.text)
    return "\n".join(parts).strip() or "(no reply)"


_engine: Engine | None = None


def get_engine() -> Engine:
    global _engine
    if _engine is None:
        _engine = Engine()
    return _engine
