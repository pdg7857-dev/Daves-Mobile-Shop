"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CARRIERS, ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/orders";

type Props = {
  id: number;
  initialStatus: OrderStatus;
  initialTrackingNumber: string;
  initialCarrier: string;
  initialAdminNotes: string;
};

export default function OrderActions({
  id,
  initialStatus,
  initialTrackingNumber,
  initialCarrier,
  initialAdminNotes
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber);
  const [carrier, setCarrier] = useState(initialCarrier);
  const [adminNotes, setAdminNotes] = useState(initialAdminNotes);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Resync form state when the order changes server-side (after router.refresh()
  // or after another admin tab updates it).
  useEffect(() => {
    setStatus(initialStatus);
    setTrackingNumber(initialTrackingNumber);
    setCarrier(initialCarrier);
    setAdminNotes(initialAdminNotes);
  }, [initialStatus, initialTrackingNumber, initialCarrier, initialAdminNotes]);

  async function save() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status, trackingNumber, carrier, adminNotes })
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
    <div className="card p-5">
      <h2 className="font-semibold text-gray-900">Update order</h2>
      <p className="text-xs text-gray-500">Marking as <strong>shipped</strong> finalizes inventory (phones become <em>sold</em>). Marking as <strong>cancelled</strong> restores phones to <em>for sale</em> and replenishes part stock.</p>

      {error && <div className="mt-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm p-3">{error}</div>}

      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Status</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Carrier</label>
          <select className="input" value={carrier} onChange={(e) => setCarrier(e.target.value)}>
            <option value="">— None —</option>
            {CARRIERS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Tracking number</label>
          <input className="input font-mono" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Admin notes (internal only)</label>
          <textarea className="input min-h-[80px]" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs text-gray-500">{savedAt && `Saved ${new Date(savedAt).toLocaleTimeString("en-CA")}`}</span>
        <button onClick={save} disabled={busy} className="btn-primary">{busy ? "Saving…" : "Save changes"}</button>
      </div>
    </div>
  );
}
