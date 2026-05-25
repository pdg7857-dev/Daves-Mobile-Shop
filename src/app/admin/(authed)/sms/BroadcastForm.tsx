"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MAX_LEN = 320; // ~2 SMS segments

const PRESETS = [
  {
    name: "Restock alert",
    text: "Dave's Mobile: Fresh stock just landed — iPhone 15 Pros and Galaxy S24 Ultras. Shop now: <link>  Reply STOP to opt out."
  },
  {
    name: "Weekend sale",
    text: "Dave's Mobile: Weekend flash sale — 10% off any refurbished phone with code WEEKEND10. Ends Sunday 9pm.  Reply STOP to opt out."
  },
  {
    name: "Free shipping push",
    text: "Dave's Mobile: This week only — free shipping on every order, no minimum. Shop: <link>  Reply STOP to opt out."
  }
];

export default function BroadcastForm({ recipientCount }: { recipientCount: number }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);

  const segments = Math.max(1, Math.ceil(body.length / 160));

  async function send() {
    setError(null);
    if (body.trim().length < 10) {
      setError("Message is too short");
      return;
    }
    if (body.length > MAX_LEN) {
      setError(`Message must be under ${MAX_LEN} characters`);
      return;
    }
    if (!confirm(`Send this SMS to ${recipientCount} customer${recipientCount === 1 ? "" : "s"}? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    setResult(null);
    const res = await fetch("/api/admin/sms/broadcast", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body })
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to send");
      return;
    }
    const data = await res.json();
    setResult({ sent: data.sent, failed: data.failed });
    setBody("");
    router.refresh();
  }

  return (
    <div className="card p-5 space-y-4">
      <div>
        <label className="label">Message body</label>
        <textarea
          className="input min-h-[120px]"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Dave's Mobile: ..."
          maxLength={MAX_LEN}
        />
        <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
          <span>
            {body.length}/{MAX_LEN} chars · {segments} SMS segment{segments === 1 ? "" : "s"} per recipient
          </span>
          <span>
            Cost estimate: ~${(0.01 * segments * recipientCount).toFixed(2)} for {recipientCount} recipients
          </span>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-2">Quick presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => setBody(p.text)}
              className="text-xs rounded-full bg-gray-100 hover:bg-gray-200 px-3 py-1.5 text-gray-700"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-600 bg-amber-50 border border-amber-200 rounded-md p-3">
        <strong>CASL reminders:</strong> Include &ldquo;Dave&rsquo;s Mobile&rdquo; in the message so the customer
        knows it&rsquo;s from you. The footer &ldquo;Reply STOP to opt out&rdquo; is required —
        the system handles STOP / HELP keywords automatically, but the text must be visible to recipients.
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>}
      {result && (
        <div className="text-sm bg-green-50 border border-green-200 rounded-md p-3">
          ✓ Broadcast complete. Sent: <strong>{result.sent}</strong>, Failed: <strong>{result.failed}</strong>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button onClick={send} disabled={busy || recipientCount === 0} className="btn-primary">
          {busy ? "Sending…" : `Send to ${recipientCount} customer${recipientCount === 1 ? "" : "s"}`}
        </button>
      </div>
    </div>
  );
}
