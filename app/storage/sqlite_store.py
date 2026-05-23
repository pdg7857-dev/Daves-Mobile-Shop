from __future__ import annotations

import sqlite3
import threading
import time
from pathlib import Path

from app.storage.store import Conversation, Lead, Message, Ticket, TicketStatus

SCHEMA = """
CREATE TABLE IF NOT EXISTS conversations (
    sender_id      TEXT PRIMARY KEY,
    human_takeover INTEGER NOT NULL DEFAULT 0,
    created_at     REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id  TEXT NOT NULL,
    role       TEXT NOT NULL,
    content    TEXT NOT NULL,
    ts         REAL NOT NULL,
    FOREIGN KEY (sender_id) REFERENCES conversations(sender_id)
);
CREATE INDEX IF NOT EXISTS idx_messages_sender_ts ON messages(sender_id, ts);

CREATE TABLE IF NOT EXISTS leads (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id  TEXT NOT NULL,
    kind       TEXT NOT NULL,
    summary    TEXT NOT NULL,
    device     TEXT,
    issue      TEXT,
    contact    TEXT,
    ts         REAL NOT NULL,
    FOREIGN KEY (sender_id) REFERENCES conversations(sender_id)
);
CREATE INDEX IF NOT EXISTS idx_leads_sender_ts ON leads(sender_id, ts);

CREATE TABLE IF NOT EXISTS tickets (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name   TEXT NOT NULL,
    customer_phone  TEXT NOT NULL,
    customer_email  TEXT NOT NULL,
    device          TEXT NOT NULL,
    issue           TEXT NOT NULL,
    status          TEXT NOT NULL,
    notes           TEXT NOT NULL DEFAULT '',
    created_at      REAL NOT NULL,
    updated_at      REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tickets_phone ON tickets(customer_phone);
CREATE INDEX IF NOT EXISTS idx_tickets_email ON tickets(customer_email);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
"""


class SqliteStore:
    """Persistent Store implementation backed by SQLite.

    Uses a single connection guarded by a lock — fine for the kind of QPS a
    single Messenger page sees. Swap for a connection pool if traffic grows.
    """

    def __init__(self, db_path: str | Path) -> None:
        self.db_path = str(db_path)
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        self._conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._conn.executescript(SCHEMA)
        self._conn.commit()

    def _ensure_conversation_row(self, sender_id: str) -> None:
        self._conn.execute(
            "INSERT OR IGNORE INTO conversations (sender_id, human_takeover, created_at) "
            "VALUES (?, 0, ?)",
            (sender_id, time.time()),
        )

    def get_conversation(self, sender_id: str) -> Conversation:
        with self._lock:
            self._ensure_conversation_row(sender_id)
            row = self._conn.execute(
                "SELECT human_takeover FROM conversations WHERE sender_id=?",
                (sender_id,),
            ).fetchone()
            msgs = self._conn.execute(
                "SELECT role, content, ts FROM messages WHERE sender_id=? ORDER BY ts ASC",
                (sender_id,),
            ).fetchall()
            leads = self._conn.execute(
                "SELECT kind, summary, device, issue, contact, ts FROM leads "
                "WHERE sender_id=? ORDER BY ts ASC",
                (sender_id,),
            ).fetchall()
            self._conn.commit()

        return Conversation(
            sender_id=sender_id,
            messages=[Message(role=m["role"], content=m["content"], ts=m["ts"]) for m in msgs],
            human_takeover=bool(row["human_takeover"]),
            leads=[
                Lead(
                    sender_id=sender_id,
                    kind=l["kind"],
                    summary=l["summary"],
                    device=l["device"],
                    issue=l["issue"],
                    contact=l["contact"],
                    ts=l["ts"],
                )
                for l in leads
            ],
        )

    def append_message(self, sender_id: str, role: str, content: str) -> None:
        with self._lock:
            self._ensure_conversation_row(sender_id)
            self._conn.execute(
                "INSERT INTO messages (sender_id, role, content, ts) VALUES (?, ?, ?, ?)",
                (sender_id, role, content, time.time()),
            )
            self._conn.commit()

    def set_human_takeover(self, sender_id: str, on: bool) -> None:
        with self._lock:
            self._ensure_conversation_row(sender_id)
            self._conn.execute(
                "UPDATE conversations SET human_takeover=? WHERE sender_id=?",
                (1 if on else 0, sender_id),
            )
            self._conn.commit()

    def add_lead(self, lead: Lead) -> None:
        with self._lock:
            self._ensure_conversation_row(lead.sender_id)
            self._conn.execute(
                "INSERT INTO leads (sender_id, kind, summary, device, issue, contact, ts) "
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                (
                    lead.sender_id,
                    lead.kind,
                    lead.summary,
                    lead.device,
                    lead.issue,
                    lead.contact,
                    lead.ts,
                ),
            )
            self._conn.commit()

    # Admin/dashboard helpers — not part of the Store protocol but handy.
    def list_conversations(self) -> list[dict]:
        with self._lock:
            rows = self._conn.execute(
                """
                SELECT c.sender_id,
                       c.human_takeover,
                       c.created_at,
                       (SELECT COUNT(*) FROM messages m WHERE m.sender_id = c.sender_id) AS msg_count,
                       (SELECT MAX(ts) FROM messages m WHERE m.sender_id = c.sender_id) AS last_msg_ts,
                       (SELECT COUNT(*) FROM leads l WHERE l.sender_id = c.sender_id) AS lead_count
                  FROM conversations c
              ORDER BY COALESCE(last_msg_ts, c.created_at) DESC
                """
            ).fetchall()
        return [dict(r) for r in rows]

    def list_leads(self) -> list[dict]:
        with self._lock:
            rows = self._conn.execute(
                "SELECT id, sender_id, kind, summary, device, issue, contact, ts "
                "FROM leads ORDER BY ts DESC"
            ).fetchall()
        return [dict(r) for r in rows]

    # --- tickets ---

    def create_ticket(self, ticket: Ticket) -> Ticket:
        with self._lock:
            cur = self._conn.execute(
                "INSERT INTO tickets (customer_name, customer_phone, customer_email, "
                "device, issue, status, notes, created_at, updated_at) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    ticket.customer_name,
                    ticket.customer_phone,
                    ticket.customer_email,
                    ticket.device,
                    ticket.issue,
                    ticket.status,
                    ticket.notes,
                    ticket.created_at,
                    ticket.updated_at,
                ),
            )
            self._conn.commit()
            ticket.id = cur.lastrowid
        return ticket

    def list_tickets(self) -> list[Ticket]:
        with self._lock:
            rows = self._conn.execute(
                "SELECT * FROM tickets ORDER BY updated_at DESC"
            ).fetchall()
        return [_row_to_ticket(r) for r in rows]

    def find_tickets(self, query: str) -> list[Ticket]:
        q = query.strip().lower()
        if not q:
            return []
        digits = "".join(c for c in q if c.isdigit())
        clauses: list[str] = []
        params: list[object] = []
        if digits and len(digits) >= 4:
            clauses.append("REPLACE(REPLACE(REPLACE(REPLACE(customer_phone, '-', ''), ' ', ''), '(', ''), ')', '') LIKE ?")
            params.append(f"%{digits}%")
        clauses.append("LOWER(customer_email) LIKE ?")
        params.append(f"%{q}%")
        clauses.append("LOWER(customer_name) LIKE ?")
        params.append(f"%{q}%")
        if q.lstrip("#").isdigit():
            clauses.append("id = ?")
            params.append(int(q.lstrip("#")))
        sql = "SELECT * FROM tickets WHERE " + " OR ".join(clauses) + " ORDER BY updated_at DESC"
        with self._lock:
            rows = self._conn.execute(sql, params).fetchall()
        return [_row_to_ticket(r) for r in rows]

    def update_ticket_status(self, ticket_id: int, status: TicketStatus) -> Ticket | None:
        with self._lock:
            self._conn.execute(
                "UPDATE tickets SET status=?, updated_at=? WHERE id=?",
                (status, time.time(), ticket_id),
            )
            self._conn.commit()
            row = self._conn.execute(
                "SELECT * FROM tickets WHERE id=?", (ticket_id,)
            ).fetchone()
        return _row_to_ticket(row) if row else None

    def close(self) -> None:
        with self._lock:
            self._conn.close()


def _row_to_ticket(row: sqlite3.Row) -> Ticket:
    return Ticket(
        id=row["id"],
        customer_name=row["customer_name"],
        customer_phone=row["customer_phone"],
        customer_email=row["customer_email"],
        device=row["device"],
        issue=row["issue"],
        status=row["status"],
        notes=row["notes"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )
