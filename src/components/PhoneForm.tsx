"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES } from "@/lib/cities";
import PhotoUpload from "@/components/PhotoUpload";
import DevicePicker from "@/components/DevicePicker";

type Supplier = { id: number; name: string };

type PhoneFields = {
  id?: number;
  brand: string;
  model: string;
  storage?: string | null;
  color?: string | null;
  condition: string;
  imei?: string | null;
  serial?: string | null;
  purchasePrice: number | string;
  askingPrice?: number | string | null;
  status: string;
  purchaseDate: string;
  purchasedFrom?: string | null;
  supplierId?: number | null;
  notes?: string | null;
  repairNeeded?: string | null;
  city?: string | null;
  imageUrl?: string | null;
};

export default function PhoneForm({
  initial,
  suppliers,
  mode
}: {
  initial: PhoneFields;
  suppliers: Supplier[];
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [form, setForm] = useState<PhoneFields>(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function update<K extends keyof PhoneFields>(key: K, value: PhoneFields[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const url = mode === "create" ? "/api/inventory" : `/api/inventory/${initial.id}`;
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
    const phone = await res.json();
    router.push(`/admin/inventory/${phone.id}`);
    router.refresh();
  }

  async function remove() {
    if (!initial.id) return;
    if (!confirm("Delete this phone? This cannot be undone.")) return;
    setBusy(true);
    const res = await fetch(`/api/inventory/${initial.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      router.push("/admin/inventory");
      router.refresh();
    } else {
      setError("Delete failed");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && <div className="rounded-md bg-red-50 border border-red-200 text-red-800 text-sm p-3">{error}</div>}

      <fieldset className="card p-5">
        <legend className="px-2 text-sm font-semibold text-gray-700">Device</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <DevicePicker
            brand={form.brand}
            model={form.model}
            storage={form.storage || ""}
            color={form.color || ""}
            onChange={(next) =>
              setForm((f) => ({
                ...f,
                brand: next.brand,
                model: next.model,
                storage: next.storage,
                color: next.color
              }))
            }
          />
          <div>
            <label className="label">Condition *</label>
            <select className="input" required value={form.condition} onChange={(e) => update("condition", e.target.value)}>
              <option value="">Select…</option>
              <option>New</option>
              <option>Like New</option>
              <option>Good</option>
              <option>Fair</option>
              <option>For Parts</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => update("status", e.target.value)}>
              <option value="for_sale">For sale</option>
              <option value="in_repair">In repair</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </select>
          </div>
          <div>
            <label className="label">IMEI</label>
            <input className="input font-mono" value={form.imei || ""} onChange={(e) => update("imei", e.target.value)} placeholder="15 digits" />
          </div>
          <div>
            <label className="label">Serial number</label>
            <input className="input font-mono" value={form.serial || ""} onChange={(e) => update("serial", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <PhotoUpload
              value={form.imageUrl || null}
              onChange={(url) => update("imageUrl", url)}
              label="Photo"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="card p-5">
        <legend className="px-2 text-sm font-semibold text-gray-700">Repairs needed</legend>
        <div>
          <label className="label">Repairs this phone needs before sale</label>
          <textarea
            className="input min-h-[70px]"
            value={form.repairNeeded || ""}
            onChange={(e) => update("repairNeeded", e.target.value)}
            placeholder="e.g. New screen + battery, replace back glass"
          />
          <p className="text-xs text-gray-500 mt-1">
            Shows as a badge on the inventory list. Leave blank when no repairs are pending.
            Log completed repairs below after fixing.
          </p>
        </div>
      </fieldset>

      <fieldset className="card p-5">
        <legend className="px-2 text-sm font-semibold text-gray-700">Purchase</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Purchase date *</label>
            <input className="input" type="date" required value={form.purchaseDate} onChange={(e) => update("purchaseDate", e.target.value)} />
          </div>
          <div>
            <label className="label">Purchase price (CAD) *</label>
            <input className="input" type="number" step="0.01" required value={form.purchasePrice} onChange={(e) => update("purchasePrice", e.target.value)} />
          </div>
          <div>
            <label className="label">Supplier</label>
            <select className="input" value={form.supplierId || ""} onChange={(e) => update("supplierId", e.target.value ? Number(e.target.value) : null)}>
              <option value="">— None —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Purchased from (free text)</label>
            <input className="input" value={form.purchasedFrom || ""} onChange={(e) => update("purchasedFrom", e.target.value)} placeholder="Used if no supplier above" />
          </div>
        </div>
      </fieldset>

      <fieldset className="card p-5">
        <legend className="px-2 text-sm font-semibold text-gray-700">Listing</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Asking price (CAD)</label>
            <input className="input" type="number" step="0.01" value={form.askingPrice ?? ""} onChange={(e) => update("askingPrice", e.target.value)} />
          </div>
          <div>
            <label className="label">Listing city</label>
            <select className="input" value={form.city || ""} onChange={(e) => update("city", e.target.value)}>
              <option value="">— Any —</option>
              {CITIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Notes (shown on listing)</label>
            <textarea className="input min-h-[100px]" value={form.notes || ""} onChange={(e) => update("notes", e.target.value)} placeholder="Battery health, repairs done, scuffs, etc." />
          </div>
        </div>
      </fieldset>

      <div className="flex items-center justify-between gap-3">
        <div>
          {mode === "edit" && (
            <button type="button" onClick={remove} disabled={busy} className="btn-danger">
              Delete
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? "Saving…" : mode === "create" ? "Create phone" : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
