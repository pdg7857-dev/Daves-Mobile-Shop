"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initial: {
    shippingFlatRate: number;
    freeShippingThreshold: number | null;
  };
};

export default function SettingsForm({ initial }: Props) {
  const router = useRouter();
  const [shippingFlatRate, setRate] = useState(String(initial.shippingFlatRate));
  const [freeShippingEnabled, setFreeEnabled] = useState(initial.freeShippingThreshold != null);
  const [threshold, setThreshold] = useState(
    initial.freeShippingThreshold != null ? String(initial.freeShippingThreshold) : ""
  );
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        shippingFlatRate: Number(shippingFlatRate),
        freeShippingThreshold: freeShippingEnabled && threshold ? Number(threshold) : null
      })
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Save failed" }));
      setError(data.error || "Save failed");
      return;
    }
    setSavedAt(Date.now());
    router.refresh();
  }

  return (
    <form onSubmit={save} className="mt-6 max-w-xl space-y-6">
      {error && <div className="rounded-md bg-red-50 border border-red-200 text-red-800 text-sm p-3">{error}</div>}

      <fieldset className="card p-5">
        <legend className="px-2 text-sm font-semibold text-gray-700">Shipping</legend>
        <div className="space-y-4">
          <div>
            <label className="label">Flat shipping rate (CAD)</label>
            <input className="input" type="number" step="0.01" min="0" required value={shippingFlatRate} onChange={(e) => setRate(e.target.value)} />
            <p className="mt-1 text-xs text-gray-500">Charged on every Canadian order unless free-shipping threshold is met.</p>
          </div>
          <div className="flex items-start gap-3">
            <input type="checkbox" id="freeship" checked={freeShippingEnabled} onChange={(e) => setFreeEnabled(e.target.checked)} className="mt-1" />
            <label htmlFor="freeship" className="text-sm text-gray-700">Offer free shipping over a threshold</label>
          </div>
          {freeShippingEnabled && (
            <div>
              <label className="label">Free shipping over (CAD)</label>
              <input className="input" type="number" step="0.01" min="0" value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="e.g. 200" />
            </div>
          )}
        </div>
      </fieldset>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {savedAt && `Saved ${new Date(savedAt).toLocaleTimeString("en-CA")}`}
        </span>
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
