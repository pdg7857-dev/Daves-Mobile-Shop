"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DiscountFields = {
  id?: number;
  code: string;
  description?: string | null;
  discountType: "percentage" | "fixed";
  discountValue: number | string;
  minOrderAmount?: number | string | null;
  maxUses?: number | string | null;
  active: boolean;
  expiresAt?: string | null;
};

export default function DiscountForm({
  initial,
  mode
}: {
  initial: DiscountFields;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [form, setForm] = useState<DiscountFields>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof DiscountFields>(key: K, value: DiscountFields[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const url = mode === "create" ? "/api/admin/discounts" : `/api/admin/discounts/${initial.id}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...form,
        code: form.code.toUpperCase().trim(),
        minOrderAmount: form.minOrderAmount === "" || form.minOrderAmount == null ? null : Number(form.minOrderAmount),
        maxUses: form.maxUses === "" || form.maxUses == null ? null : Number(form.maxUses),
        discountValue: Number(form.discountValue),
        expiresAt: form.expiresAt || null
      })
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Save failed" }));
      setError(data.error || "Save failed");
      return;
    }
    router.push("/admin/discounts");
    router.refresh();
  }

  async function remove() {
    if (!initial.id) return;
    if (!confirm("Delete this discount code?")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/discounts/${initial.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      router.push("/admin/discounts");
      router.refresh();
    }
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-4">
      {error && <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm p-3">{error}</div>}

      <div className="card p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Code *</label>
            <input
              className="input font-mono uppercase"
              required
              value={form.code}
              onChange={(e) => update("code", e.target.value.toUpperCase())}
              placeholder="WELCOME10"
            />
          </div>
          <div>
            <label className="label">Active</label>
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" checked={form.active} onChange={(e) => update("active", e.target.checked)} />
              <span className="text-sm text-gray-700">{form.active ? "Customers can use this code" : "Disabled"}</span>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description (internal)</label>
            <input className="input" value={form.description || ""} onChange={(e) => update("description", e.target.value)} placeholder="Holiday sale 2026" />
          </div>
          <div>
            <label className="label">Discount type *</label>
            <select className="input" value={form.discountType} onChange={(e) => update("discountType", e.target.value as "percentage" | "fixed")}>
              <option value="percentage">Percentage off</option>
              <option value="fixed">Fixed amount off</option>
            </select>
          </div>
          <div>
            <label className="label">{form.discountType === "percentage" ? "Percent (1–100)" : "Amount (CAD)"} *</label>
            <input className="input" type="number" step={form.discountType === "percentage" ? "1" : "0.01"} min="0" required value={form.discountValue} onChange={(e) => update("discountValue", e.target.value)} />
          </div>
          <div>
            <label className="label">Minimum order amount (CAD)</label>
            <input className="input" type="number" step="0.01" min="0" value={form.minOrderAmount ?? ""} onChange={(e) => update("minOrderAmount", e.target.value)} placeholder="Optional" />
          </div>
          <div>
            <label className="label">Max total uses</label>
            <input className="input" type="number" min="1" value={form.maxUses ?? ""} onChange={(e) => update("maxUses", e.target.value)} placeholder="Optional (unlimited)" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Expires on</label>
            <input className="input" type="date" value={form.expiresAt || ""} onChange={(e) => update("expiresAt", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        {mode === "edit" ? (
          <button type="button" onClick={remove} disabled={busy} className="btn-danger">Delete</button>
        ) : <span />}
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? "Saving…" : mode === "create" ? "Create code" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
