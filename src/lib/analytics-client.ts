"use client";

// Tiny client-side tracker. No external services, no fingerprinting.
// Visitor ID lives in a long-lived first-party cookie (set by middleware).
// Session ID lives in sessionStorage and resets after 30 min of inactivity.

const SESSION_KEY = "dms_sid";
const SESSION_TS_KEY = "dms_sts";
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 min

function newId(): string {
  return (typeof crypto !== "undefined" && "randomUUID" in crypto)
    ? crypto.randomUUID().replace(/-/g, "")
    : `s${Date.now()}${Math.random().toString(36).slice(2, 10)}`;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    const ts = Number(sessionStorage.getItem(SESSION_TS_KEY) || 0);
    if (stored && Date.now() - ts < SESSION_TTL_MS) {
      sessionStorage.setItem(SESSION_TS_KEY, String(Date.now()));
      return stored;
    }
    const id = newId();
    sessionStorage.setItem(SESSION_KEY, id);
    sessionStorage.setItem(SESSION_TS_KEY, String(Date.now()));
    return id;
  } catch {
    return newId();
  }
}

function parseUtm(search: string): { source?: string; medium?: string; campaign?: string } {
  if (!search) return {};
  const p = new URLSearchParams(search);
  return {
    source: p.get("utm_source") || undefined,
    medium: p.get("utm_medium") || undefined,
    campaign: p.get("utm_campaign") || undefined
  };
}

async function post(payload: Record<string, unknown>) {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      // keepalive so it survives a page-leave navigation
      keepalive: true,
      body: JSON.stringify({ ...payload, sessionId: getSessionId() })
    });
  } catch {
    /* swallow */
  }
}

export function trackPageView(path?: string) {
  if (typeof window === "undefined") return;
  void post({
    type: "pageview",
    path: path ?? window.location.pathname,
    referrer: document.referrer || undefined,
    utm: parseUtm(window.location.search)
  });
}

export function trackEvent(name: string, metadata?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  void post({
    type: "event",
    name,
    path: window.location.pathname,
    metadata
  });
}
