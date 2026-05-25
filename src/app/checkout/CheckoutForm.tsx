"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { money } from "@/lib/format";
import { PROVINCES, calculateTotals, isValidPostalCode } from "@/lib/shipping";
import type { ShippingConfig } from "@/lib/settings";
import { DAVE_CARE_PRICES } from "@/lib/dave-care";
import { trackEvent } from "@/lib/analytics-client";

type DiscountState = {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discountAmount: number;
};

export default function CheckoutForm({ shippingConfig }: { shippingConfig: ShippingConfig }) {
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
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [discount, setDiscount] = useState<DiscountState | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoBusy, setPromoBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(
    () => calculateTotals(subtotal, form.province, shippingConfig, discount?.discountAmount ?? 0),
    [subtotal, form.province, shippingConfig, discount]
  );

  // Fire begin_checkout once when the form mounts with items
  useEffect(() => {
    if (hydrated && items.length > 0) {
      trackEvent("begin_checkout", {
        itemCount: items.length,
        subtotal,
        items: items.map((i) => ({ type: i.type, id: i.id, name: i.name, price: i.price }))
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!hydrated) return <div className="mt-6 text-gray-500">Loading…</div>;

  if (items.length === 0) {
    return (
      <div className="mt-8 card p-10 text-center">
        <p className="text-gray-400">Your cart is empty.</p>
        <Link href="/inventory" className="btn-primary mt-4 inline-flex">Shop phones</Link>
      </div>
    );
  }

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function applyPromo() {
    setPromoError(null);
    if (!promoInput.trim()) return;
    setPromoBusy(true);
    const res = await fetch("/api/discounts/validate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: promoInput.trim(), subtotal })
    });
    setPromoBusy(false);
    const data = await res.json();
    if (!data.ok) {
      setPromoError(data.reason || "Invalid code");
      setDiscount(null);
      return;
    }
    setDiscount({
      code: data.code,
      discountType: data.discountType,
      discountValue: data.discountValue,
      discountAmount: data.discountAmount
    });
  }

  function removePromo() {
    setDiscount(null);
    setPromoInput("");
    setPromoError(null);
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
        smsOptIn: smsOptIn && !!form.customerPhone.trim(),
        discountCode: discount?.code,
        items: items.map((i) => ({
          type: i.type,
          id: i.id,
          quantity: i.quantity,
          daveCarePlan: i.type === "phone" ? i.daveCarePlan ?? null : null
        }))
      })
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Order failed" }));
      setError(data.error || "Order failed");
      return;
    }
    const order = await res.json();
    trackEvent("purchase", {
      orderNumber: order.orderNumber,
      total: order.total,
      currency: "CAD",
      items: items.map((i) => ({ type: i.type, id: i.id, name: i.name, price: i.price, quantity: i.quantity }))
    });
    clear();
    router.push(`/orders/${order.orderNumber}?email=${encodeURIComponent(form.customerEmail)}&new=1`);
  }

  return (
    <form onSubmit={submit} className="mt-6 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {error && (
          <div className="rounded-md bg-red-900/30 border border-red-700/50 text-red-300 text-sm p-3">{error}</div>
        )}

        <fieldset className="card p-5">
          <legend className="px-2 text-sm font-semibold text-gray-300">Contact</legend>
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
            <div className="sm:col-span-2">
              <label className="flex items-start gap-3 cursor-pointer select-none p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
                <input
                  type="checkbox"
                  checked={smsOptIn}
                  onChange={(e) => setSmsOptIn(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[color:var(--apple-blue)]"
                  disabled={!form.customerPhone.trim()}
                />
                <div className="text-sm">
                  <span className="text-white font-medium">Text me deals + shipping updates</span>
                  <p className="mt-0.5 text-[12px] text-white/55 leading-snug">
                    Occasional promos, restock alerts and order updates by SMS. ~1-4 messages/month. Reply STOP anytime to unsubscribe.
                    {!form.customerPhone.trim() && <span className="block text-amber-300 mt-1">Add a phone number above first.</span>}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </fieldset>

        <fieldset className="card p-5">
          <legend className="px-2 text-sm font-semibold text-gray-300">Shipping address (Canada only)</legend>
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
              <input className="input bg-gray-800" disabled value="Canada" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Order notes (optional)</label>
              <textarea className="input min-h-[70px]" value={form.customerNotes} onChange={(e) => update("customerNotes", e.target.value)} placeholder="Buzzer code, delivery instructions, etc." />
            </div>
          </div>
        </fieldset>

        <div className="card p-5 bg-amber-900/30 border-amber-700/50">
          <h3 className="font-semibold text-amber-300">Payment</h3>
          <p className="mt-1 text-sm text-amber-300">
            Once you place your order we&apos;ll email Interac e-Transfer instructions. Orders ship within 1 business day of payment received.
          </p>
        </div>
      </div>

      <aside className="card p-5 h-fit lg:sticky lg:top-20">
        <h2 className="font-semibold text-white">Order summary</h2>
        <ul className="mt-3 divide-y divide-gray-800 text-sm">
          {items.map((i) => (
            <li key={`${i.type}-${i.id}`} className="py-2 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-white">{i.name}</div>
                  <div className="text-xs text-gray-500">Qty {i.quantity}</div>
                </div>
                <div className="font-medium text-white whitespace-nowrap">{money(i.price * i.quantity)}</div>
              </div>
              {i.type === "phone" && i.daveCarePlan && (
                <div className="flex items-start justify-between gap-2 pl-3 border-l-2 border-brand-700/50">
                  <div>
                    <div className="text-xs text-gray-300">Dave Care ({i.daveCarePlan})</div>
                  </div>
                  <div className="text-xs font-medium text-brand-300 whitespace-nowrap">+{money(DAVE_CARE_PRICES[i.daveCarePlan])}</div>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-4 border-t border-gray-800 pt-4">
          {!discount ? (
            <div>
              <label className="label">Promo code</label>
              <div className="flex gap-2">
                <input
                  className="input font-mono uppercase"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="WELCOME10"
                />
                <button type="button" onClick={applyPromo} disabled={promoBusy} className="btn-secondary">
                  {promoBusy ? "…" : "Apply"}
                </button>
              </div>
              {promoError && <p className="mt-1 text-xs text-red-400">{promoError}</p>}
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-md bg-green-900/30 border border-green-700/50 px-3 py-2">
              <div className="text-sm">
                <div className="font-mono font-semibold text-green-300">{discount.code}</div>
                <div className="text-xs text-green-400">
                  {discount.discountType === "percentage" ? `${discount.discountValue}% off` : `${money(discount.discountValue)} off`} — saved {money(discount.discountAmount)}
                </div>
              </div>
              <button type="button" onClick={removePromo} className="text-xs text-red-400 hover:text-red-300">Remove</button>
            </div>
          )}
        </div>

        <dl className="mt-4 space-y-2 text-sm border-t border-gray-800 pt-4">
          <div className="flex justify-between"><dt className="text-gray-400">Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-green-400">
              <dt>Discount</dt>
              <dd>−{money(totals.discountAmount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-gray-400">Shipping</dt>
            <dd>{totals.shippingCost === 0 ? <span className="text-green-400 font-medium">Free</span> : money(totals.shippingCost)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-400">Tax ({Math.round(totals.taxRate * 10000) / 100}%)</dt>
            <dd>{money(totals.taxAmount)}</dd>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-800">
            <dt>Total</dt>
            <dd className="text-brand-300">{money(totals.total)}</dd>
          </div>
        </dl>
        <button type="submit" disabled={submitting} className="btn-primary w-full mt-5 justify-center">
          {submitting ? "Placing order…" : `Place order — ${money(totals.total)}`}
        </button>
        <Link href="/cart" className="block mt-3 text-center text-sm text-brand-300 hover:text-brand-200">
          ← Back to cart
        </Link>
      </aside>
    </form>
  );
}
