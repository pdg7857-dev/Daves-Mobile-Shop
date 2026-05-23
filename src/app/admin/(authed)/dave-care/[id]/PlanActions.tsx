"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DAVE_CARE_BENEFITS, type ClaimFlag } from "@/lib/dave-care";

const STATUSES = ["active", "expired", "cancelled"] as const;
type PlanStatus = (typeof STATUSES)[number];

type Claims = Record<ClaimFlag, boolean>;

type Props = {
  id: number;
  initialStatus: string;
  initialNotes: string;
  initialClaims: Claims;
};

export default function PlanActions({ id, initialStatus, initialNotes, initialClaims }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<PlanStatus>((STATUSES as readonly string[]).includes(initialStatus) ? (initialStatus as PlanStatus) : "active");
  const [notes, setNotes] = useState(initialNotes);
  const [claims, setClaims] = useState<Claims>(initialClaims);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setStatus((STATUSES as readonly string[]).includes(initialStatus) ? (initialStatus as PlanStatus) : "active");
    setNotes(initialNotes);
    setClaims(initialClaims);
  }, [initialStatus, initialNotes, initialClaims]);

  function toggle(flag: ClaimFlag) {
    setClaims((c) => ({ ...c, [flag]: !c[flag] }));
  }

  async function save() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/dave-care/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status, notes, ...claims })
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
    <div>
      {error && <div className="mt-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm p-3">{error}</div>}

      <ul className="mt-4 space-y-2">
        {DAVE_CARE_BENEFITS.map((b) => (
          <li key={b.key} className="flex items-center justify-between rounded-md border border-gray-200 p-3">
            <span className="text-sm text-gray-900">{b.label}</span>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={claims[b.flag]} onChange={() => toggle(b.flag)} />
              <span className={claims[b.flag] ? "text-gray-400" : "text-gray-700"}>{claims[b.flag] ? "Used" : "Available"}</span>
            </label>
          </li>
        ))}
      </ul>

      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Status</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value as PlanStatus)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="label">Internal notes</label>
        <textarea className="input min-h-[80px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes about claims, customer interactions, etc." />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs text-gray-500">{savedAt && `Saved ${new Date(savedAt).toLocaleTimeString("en-CA")}`}</span>
        <button onClick={save} disabled={busy} className="btn-primary">{busy ? "Saving…" : "Save changes"}</button>
      </div>
    </div>
  );
}
