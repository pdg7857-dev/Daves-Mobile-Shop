"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PartFields = {
  id?: number;
  name: string;
  category: string;
  compatibleWith: string;
  brand?: string | null;
  price: number | string;
  stock: number | string;
  imageUrl?: string | null;
  description?: string | null;
};

const CATEGORIES = ["screen", "battery", "camera", "housing", "charging-port", "speaker", "buttons", "accessory", "other"];

export default function PartForm({
  initial,
  mode
}: {
  initial: PartFields;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [form, setForm] = useState<PartFields>(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function update<K extends keyof PartFields>(key: K, value: PartFields[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const url = mode === "create" ? "/api/parts" : `/api/parts/${initial.id}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form)
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Request failed" }));
      setError(data.error || "Save failed");
      return;
    }
    router.push("/admin/parts");
    router.refresh();
  }

  async function remove() {
    if (!initial.id) return;
    if (!confirm("Delete this part?")) return;
    setBusy(true);
    const res = await fetch(`/api/parts/${initial.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      router.push("/admin/parts");
      router.refresh();
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="rounded-md bg-red-50 border border-red-200 text-red-800 text-sm p-3">{error}</div>}

      <div className="card p-5 space-y-4">
        <div>
          <label className="label">Name *</label>
          <input className="input" required value={form.name} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Category *</label>
            <select className="input" required value={form.category} onChange={(e) => update("category", e.target.value)}>
              <option value="">Select…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Brand</label>
            <input className="input" value={form.brand || ""} onChange={(e) => update("brand", e.target.value)} placeholder="OEM, Aftermarket…" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Compatible with *</label>
            <input className="input" required value={form.compatibleWith} onChange={(e) => update("compatibleWith", e.target.value)} placeholder="iPhone 14, iPhone 14 Plus" />
          </div>
          <div>
            <label className="label">Price (CAD) *</label>
            <input className="input" type="number" step="0.01" required value={form.price} onChange={(e) => update("price", e.target.value)} />
          </div>
          <div>
            <label className="label">Stock count</label>
            <input className="input" type="number" value={form.stock} onChange={(e) => update("stock", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Image URL</label>
            <input className="input" value={form.imageUrl || ""} onChange={(e) => update("imageUrl", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea className="input min-h-[80px]" value={form.description || ""} onChange={(e) => update("description", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        {mode === "edit" ? (
          <button type="button" onClick={remove} disabled={busy} className="btn-danger">Delete</button>
        ) : <span />}
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? "Saving…" : mode === "create" ? "Create part" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
