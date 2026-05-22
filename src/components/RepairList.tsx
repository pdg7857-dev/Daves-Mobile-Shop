"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SERVICES } from "@/lib/services";
import { money, date } from "@/lib/format";

type Repair = {
  id: number;
  serviceType: string;
  description: string | null;
  partCost: number | null;
  laborCost: number | null;
  performedBy: string | null;
  performedAt: string | Date;
};

export default function RepairList({ phoneId, initial }: { phoneId: number; initial: Repair[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    serviceType: "screen",
    description: "",
    partCost: "",
    laborCost: "",
    performedBy: ""
  });

  async function add() {
    if (busy) return;
    setBusy(true);
    const res = await fetch(`/api/inventory/${phoneId}/repairs`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form)
    });
    setBusy(false);
    if (res.ok) {
      setForm({ serviceType: "screen", description: "", partCost: "", laborCost: "", performedBy: "" });
      setAdding(false);
      router.refresh();
    } else {
      alert("Failed to log repair.");
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this repair record?")) return;
    const res = await fetch(`/api/inventory/${phoneId}/repairs?repairId=${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Repair history</h2>
        {!adding && (
          <button onClick={() => setAdding(true)} className="btn-secondary text-sm">+ Log repair</button>
        )}
      </div>

      {adding && (
        <div className="mt-4 card p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Service</label>
              <select className="input" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })}>
                {SERVICES.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Performed by</label>
              <input className="input" value={form.performedBy} onChange={(e) => setForm({ ...form, performedBy: e.target.value })} placeholder="Dave" />
            </div>
            <div>
              <label className="label">Part cost</label>
              <input className="input" type="number" step="0.01" value={form.partCost} onChange={(e) => setForm({ ...form, partCost: e.target.value })} />
            </div>
            <div>
              <label className="label">Labor cost</label>
              <input className="input" type="number" step="0.01" value={form.laborCost} onChange={(e) => setForm({ ...form, laborCost: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea className="input min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setAdding(false)} className="btn-secondary" disabled={busy}>Cancel</button>
            <button onClick={add} className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save repair"}</button>
          </div>
        </div>
      )}

      <ul className="mt-4 space-y-2">
        {initial.map((r) => (
          <li key={r.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900 capitalize">{r.serviceType.replace("-", " ")}</span>
                <span className="ml-2 text-xs text-gray-500">{date(r.performedAt)}</span>
                {r.performedBy && <span className="ml-2 text-xs text-gray-500">by {r.performedBy}</span>}
              </div>
              <button onClick={() => remove(r.id)} className="text-xs text-red-700 hover:text-red-900">Remove</button>
            </div>
            {r.description && <p className="mt-1 text-sm text-gray-700">{r.description}</p>}
            {(r.partCost || r.laborCost) && (
              <div className="mt-2 text-xs text-gray-600">Parts: {money(r.partCost)} · Labor: {money(r.laborCost)} · <strong>Total: {money((r.partCost ?? 0) + (r.laborCost ?? 0))}</strong></div>
            )}
          </li>
        ))}
        {initial.length === 0 && (<li className="text-sm text-gray-500 py-4">No repairs logged yet.</li>)}
      </ul>
    </div>
  );
}
