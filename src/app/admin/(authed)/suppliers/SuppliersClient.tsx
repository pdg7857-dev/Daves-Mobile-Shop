"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SupplierRow = {
  id: number;
  name: string;
  contact: string | null;
  notes: string | null;
  phoneCount: number;
};

export default function SuppliersClient({ initial }: { initial: SupplierRow[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", contact: "", notes: "" });
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/suppliers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form)
    });
    setBusy(false);
    if (res.ok) {
      setForm({ name: "", contact: "", notes: "" });
      setAdding(false);
      router.refresh();
    } else {
      alert("Failed to save supplier.");
    }
  }

  return (
    <>
      <div className="mt-6 flex justify-end">
        {!adding && (
          <button onClick={() => setAdding(true)} className="btn-primary">+ Add supplier</button>
        )}
      </div>

      {adding && (
        <form onSubmit={submit} className="mt-4 card p-5 space-y-3">
          <div>
            <label className="label">Name *</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Contact (email/phone)</label>
            <input className="input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input min-h-[80px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setAdding(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={busy} className="btn-primary">{busy ? "Saving…" : "Save supplier"}</button>
          </div>
        </form>
      )}

      <div className="mt-6 card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="table-cell">Supplier</th>
              <th className="table-cell">Contact</th>
              <th className="table-cell">Notes</th>
              <th className="table-cell text-right">Phones sourced</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {initial.map((s) => (
              <tr key={s.id}>
                <td className="table-cell font-medium text-gray-900">{s.name}</td>
                <td className="table-cell text-gray-600">{s.contact || "—"}</td>
                <td className="table-cell text-gray-600">{s.notes || "—"}</td>
                <td className="table-cell text-right">{s.phoneCount}</td>
              </tr>
            ))}
            {initial.length === 0 && (
              <tr><td className="table-cell text-center text-gray-500 py-10" colSpan={4}>No suppliers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
