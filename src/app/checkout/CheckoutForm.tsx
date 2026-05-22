"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { money } from "@/lib/format";
import { PROVINCES, calculateTotals, isValidPostalCode } from "@/lib/shipping";

export default function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clear, hydrated } = useCart();
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "ON",
    postalCode: "",
    customerNotes: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => calculateTotals(subtotal, form.province), [subtotal, form.province]);

  if (!hydrated) return <div className="mt-6 text-gray-500">Loading…</div>;

  if (items.length === 0) {
    return (
      <div className="mt-8 card p-10 text-center">
        <p className="text-gray-600">Your cart is empty.</p>
        <Link href="/inventory" className="btn-primary mt-4 inline-flex">Shop phones</Link>
      </div>
    );
  }

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValidPostalCode(form.postalCode)) {
      setError("Please enter a valid Canadian postal code (e.g. K1A 0B1).");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...form,
        items: items.map((i) => ({ type: i.type, id: i.id, quantity: i.quantity }))
      })
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Order failed" }));
      setError(data.error || "Order failed");
      return;
    }
    const order = await res.json();
    clear();
    router.push(`/orders/${order.orderNumber}?email=${encodeURIComponent(form.customerEmail)}&new=1`);
  }

  return (
    <form onSubmit={submit} className="mt-6 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 text-red-800 text-sm p-3">{error}</div>
        )}

        <fieldset className="card p-5">
          <legend className="px-2 text-sm font-semibold text-gray-700">Contact</legend>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full name *</label>
              <input className="input" required value={form.customerName} onChange={(e) => update("customerName", e.target.value)} />
            </div>
            <div>
              <label className="label">Email *</label>
              <input className="input" type="email" required value={form.customerEmail} onChange={(e) => update("customerEmail", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Phone</label>
              <input className="input" type="tel" value={form.customerPhone} onChange={(e) => update("customerPhone", e.target.value)} placeholder="For shipping updates" />
            </div>
          </div>
        </fieldset>

        <fieldset className="card p-5">
          <legend className="px-2 text-sm font-semibold text-gray-700">Shipping address (Canada only)</legend>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Address line 1 *</label>
              <input className="input" required value={form.addressLine1} onChange={(e) => update("addressLine1", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Address line 2</label>
              <input className="input" value={form.addressLine2} onChange={(e) => update("addressLine2", e.target.value)} placeholder="Apt, suite, unit" />
            </div>
            <div>
              <label className="label">City *</label>
              <input className="input" required value={form.city} onChange={(e) => update("city", e.target.value)} />
            </div>
            <div>
              <label className="label">Province *</label>
              <select className="input" required value={form.province} onChange={(e) => update("province", e.target.value)}>
                {PROVINCES.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Postal code *</label>
              <input className="input" required value={form.postalCode} onChange={(e) => update("postalCode", e.target.value.toUpperCase())} placeholder="K1A 0B1" />
            </div>
            <div>
              <label className="label">Country</label>
              <input className="input bg-gray-50" disabled value="Canada" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Order notes (optional)</label>
              <textarea className="input min-h-[70px]" value={form.customerNotes} onChange={(e) => update("customerNotes", e.target.value)} placeholder="Buzzer code, delivery instructions, etc." />
            </div>
          </div>
        </fieldset>

        <div className="card p-5 bg-amber-50 border-amber-200">
          <h3 className="font-semibold text-amber-900">Payment</h3>
          <p className="mt-1 text-sm text-amber-900">
            Once you place your order we&apos;ll email Interac e-Transfer instructions. Orders ship within 1 business day of payment received.
          </p>
        </div>
      </div>

      <aside className="card p-5 h-fit lg:sticky lg:top-20">
        <h2 className="font-semibold text-gray-900">Order summary</h2>
        <ul className="mt-3 divide-y divide-gray-100 text-sm">
          {items.map((i) => (
            <li key={`${i.type}-${i.id}`} className="py-2 flex items-start justify-between gap-2">
              <div>
                <div className="text-gray-900">{i.name}</div>
                <div className="text-xs text-gray-500">Qty {i.quantity}</div>
              </div>
              <div className="font-medium text-gray-900 whitespace-nowrap">{money(i.price * i.quantity)}</div>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 text-sm border-t border-gray-100 pt-4">
          <div className="flex justify-between"><dt className="text-gray-600">Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Shipping</dt>
            <dd>{totals.shippingCost === 0 ? <span className="text-green-700 font-medium">Free</span> : money(totals.shippingCost)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Tax ({Math.round(totals.taxRate * 10000) / 100}%)</dt>
            <dd>{money(totals.taxAmount)}</dd>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
            <dt>Total</dt>
            <dd className="text-brand-700">{money(totals.total)}</dd>
          </div>
        </dl>
        <button type="submit" disabled={submitting} className="btn-primary w-full mt-5 justify-center">
          {submitting ? "Placing order…" : `Place order — ${money(totals.total)}`}
        </button>
        <Link href="/cart" className="block mt-3 text-center text-sm text-brand-700 hover:text-brand-900">
          ← Back to cart
        </Link>
      </aside>
    </form>
  );
}
