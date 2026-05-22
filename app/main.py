from __future__ import annotations

import logging

from fastapi import FastAPI

from app.messenger import router as messenger_router

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Dave's Mobile Shop — Messenger AI")
app.include_router(messenger_router)


@app.get("/health")
async def health() -> dict:
    return {"ok": True}
