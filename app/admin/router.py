from __future__ import annotations

import datetime as dt
import html
import secrets
from typing import Any

from fastapi import APIRouter, Depends, Form, HTTPException, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from app.config import get_settings
from app.storage import get_store

router = APIRouter(prefix="/admin", tags=["admin"])
_security = HTTPBasic()


def _require_admin(creds: HTTPBasicCredentials = Depends(_security)) -> str:
    s = get_settings()
    if not s.admin_password:
        # Empty password locks the dashboard rather than allowing anonymous access.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="admin dashboard disabled (set ADMIN_PASSWORD to enable)",
        )
    user_ok = secrets.compare_digest(creds.username, s.admin_username)
    pass_ok = secrets.compare_digest(creds.password, s.admin_password)
    if not (user_ok and pass_ok):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="bad credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return creds.username


def _fmt_ts(ts: float | None) -> str:
    if not ts:
        return "—"
    return dt.datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:%M")


def _page(title: str, body: str) -> str:
    return f"""<!doctype html>
<html><head><meta charset="utf-8"><title>{html.escape(title)}</title>
<style>
  body {{ font-family: -apple-system, system-ui, sans-serif; margin: 2rem; max-width: 980px; color: #222; }}
  h1 {{ font-size: 1.4rem; }}
  nav a {{ margin-right: 1rem; }}
  table {{ border-collapse: collapse; width: 100%; }}
  th, td {{ text-align: left; padding: 0.5rem 0.6rem; border-bottom: 1px solid #eee; vertical-align: top; }}
  th {{ background: #fafafa; font-weight: 600; }}
  .tag {{ display: inline-block; padding: 0 .4rem; border-radius: 3px; background: #eee; font-size: .8rem; }}
  .tag.takeover {{ background: #fde2e2; color: #9b1b1b; }}
  .msg {{ margin: .6rem 0; padding: .6rem .8rem; border-radius: 6px; }}
  .msg.user {{ background: #f3f6fb; }}
  .msg.assistant {{ background: #eef7ee; }}
  .meta {{ color: #888; font-size: .8rem; }}
  form.inline {{ display: inline; }}
  button {{ font: inherit; padding: .35rem .7rem; border: 1px solid #bbb; background: #fff; border-radius: 4px; cursor: pointer; }}
  button:hover {{ background: #f6f6f6; }}
</style></head>
<body>
<nav><a href="/admin">Conversations</a> <a href="/admin/leads">Leads</a></nav>
<h1>{html.escape(title)}</h1>
{body}
</body></html>"""


@router.get("", response_class=HTMLResponse)
def index(_: str = Depends(_require_admin)) -> HTMLResponse:
    store: Any = get_store()
    convos = store.list_conversations()
    rows = []
    for c in convos:
        takeover = '<span class="tag takeover">HUMAN</span>' if c["human_takeover"] else ""
        rows.append(
            f"<tr>"
            f"<td><a href='/admin/conversations/{html.escape(c['sender_id'])}'>{html.escape(c['sender_id'])}</a> {takeover}</td>"
            f"<td>{c['msg_count']}</td>"
            f"<td>{c['lead_count']}</td>"
            f"<td>{_fmt_ts(c['last_msg_ts'])}</td>"
            f"</tr>"
        )
    body = (
        "<table><thead><tr><th>Sender</th><th>Messages</th><th>Leads</th><th>Last activity</th></tr></thead>"
        "<tbody>" + ("".join(rows) or "<tr><td colspan=4>No conversations yet.</td></tr>") + "</tbody></table>"
    )
    return HTMLResponse(_page("Conversations", body))


@router.get("/conversations/{sender_id}", response_class=HTMLResponse)
def conversation(sender_id: str, _: str = Depends(_require_admin)) -> HTMLResponse:
    store = get_store()
    convo = store.get_conversation(sender_id)
    msgs_html = "".join(
        f"<div class='msg {html.escape(m.role)}'>"
        f"<div class='meta'>{html.escape(m.role)} · {_fmt_ts(m.ts)}</div>"
        f"<div>{html.escape(m.content).replace(chr(10), '<br>')}</div>"
        f"</div>"
        for m in convo.messages
    ) or "<p>No messages yet.</p>"

    leads_html = ""
    if convo.leads:
        leads_html = "<h3>Leads</h3><ul>" + "".join(
            f"<li><b>{html.escape(l.kind)}</b> · {html.escape(l.summary)}"
            + (f" · device: {html.escape(l.device)}" if l.device else "")
            + (f" · contact: {html.escape(l.contact)}" if l.contact else "")
            + "</li>"
            for l in convo.leads
        ) + "</ul>"

    takeover_btn = (
        f"<form class='inline' method='post' action='/admin/conversations/{html.escape(sender_id)}/takeover'>"
        f"<input type='hidden' name='on' value='{'0' if convo.human_takeover else '1'}'>"
        f"<button>{'Resume bot' if convo.human_takeover else 'Take over (silence bot)'}</button>"
        f"</form>"
    )

    body = (
        f"<p>{takeover_btn} "
        + ("<span class='tag takeover'>Human is handling this conversation</span>" if convo.human_takeover else "")
        + f"</p>{leads_html}<h3>Transcript</h3>{msgs_html}"
    )
    return HTMLResponse(_page(f"Conversation {sender_id}", body))


@router.post("/conversations/{sender_id}/takeover")
def toggle_takeover(
    sender_id: str,
    on: str = Form(...),
    _: str = Depends(_require_admin),
) -> RedirectResponse:
    get_store().set_human_takeover(sender_id, on == "1")
    return RedirectResponse(url=f"/admin/conversations/{sender_id}", status_code=303)


@router.get("/leads", response_class=HTMLResponse)
def leads(_: str = Depends(_require_admin)) -> HTMLResponse:
    store: Any = get_store()
    rows_data = store.list_leads()
    rows = "".join(
        f"<tr>"
        f"<td>{_fmt_ts(r['ts'])}</td>"
        f"<td>{html.escape(r['kind'])}</td>"
        f"<td><a href='/admin/conversations/{html.escape(r['sender_id'])}'>{html.escape(r['sender_id'])}</a></td>"
        f"<td>{html.escape(r['summary'])}</td>"
        f"<td>{html.escape(r.get('device') or '')}</td>"
        f"<td>{html.escape(r.get('contact') or '')}</td>"
        f"</tr>"
        for r in rows_data
    )
    body = (
        "<table><thead><tr><th>When</th><th>Kind</th><th>Sender</th><th>Summary</th>"
        "<th>Device</th><th>Contact</th></tr></thead>"
        "<tbody>" + (rows or "<tr><td colspan=6>No leads yet.</td></tr>") + "</tbody></table>"
    )
    return HTMLResponse(_page("Leads", body))
