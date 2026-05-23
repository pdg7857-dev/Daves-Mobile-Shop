from __future__ import annotations

import threading
import time
from collections import defaultdict, deque


class RateLimiter:
    """Sliding-window rate limiter, in-process.

    `allow(sender_id)` returns True if the sender hasn't exceeded `max_events`
    in the past `window_seconds`. State is kept in memory — restart resets it,
    which is fine for spam dampening but use Redis if you need cross-process.
    """

    def __init__(self, max_events: int = 30, window_seconds: float = 300.0) -> None:
        self.max_events = max_events
        self.window_seconds = window_seconds
        self._events: dict[str, deque[float]] = defaultdict(deque)
        self._notified: dict[str, float] = {}
        self._lock = threading.Lock()

    def allow(self, sender_id: str, now: float | None = None) -> bool:
        t = now if now is not None else time.time()
        with self._lock:
            q = self._events[sender_id]
            cutoff = t - self.window_seconds
            while q and q[0] < cutoff:
                q.popleft()
            if len(q) >= self.max_events:
                return False
            q.append(t)
            return True

    def should_notify(self, sender_id: str, cooldown: float = 60.0, now: float | None = None) -> bool:
        """Once a sender is blocked, only send one 'slow down' reply per cooldown."""
        t = now if now is not None else time.time()
        with self._lock:
            last = self._notified.get(sender_id)
            if last is not None and t - last < cooldown:
                return False
            self._notified[sender_id] = t
            return True


_limiter: RateLimiter | None = None


def get_rate_limiter() -> RateLimiter:
    global _limiter
    if _limiter is None:
        from app.config import get_settings

        s = get_settings()
        _limiter = RateLimiter(
            max_events=s.rate_limit_max_events,
            window_seconds=s.rate_limit_window_seconds,
        )
    return _limiter


def reset_rate_limiter_singleton() -> None:
    global _limiter
    _limiter = None
