"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { money } from "@/lib/format";
import { DAVE_CARE_PRICES, type DaveCarePlanType } from "@/lib/dave-care";

export default function CartView({ freeShippingThreshold }: { freeShippingThreshold: number | null }) {
  const { items, setQty, remove, setDaveCarePlan, subtotal, hydrated, count } = useCart();
  const [editingPlanFor, setEditingPlanFor] = useState<number | null>(null);

  if (!hydrated) {
    return <div className="mt-6 text-gray-500">Loading…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 card p-10 text-center">
        <p className="text-gray-400">Your cart is empty.</p>
        <div className="mt-4 flex gap-3 justify-center">
          <Link href="/inventory" className="btn-primary">Shop phones</Link>
          <Link href="/parts" className="btn-secondary">Shop parts</Link>
        </div>
      </div>
    );
  }

  const remaining = freeShippingThreshold != null ? freeShippingThreshold - subtotal : 0;

  function pickPlan(phoneId: number, plan: DaveCarePlanType | null) {
    setDaveCarePlan(phoneId, plan);
    setEditingPlanFor(null);
  }

  return (
    <div className="mt-6 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-3">
        {items.map((item) => (
          <div key={`${item.type}-${item.id}`} className="card p-4">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded bg-gray-800 flex items-center justify-center text-3xl shrink-0">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded" />
                ) : (
                  <span>{item.type === "phone" ? "📱" : "🔧"}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={item.type === "phone" ? `/inventory/${item.id}` : `/parts/${item.id}`} className="font-medium text-white hover:text-brand-300">{item.name}</Link>
                    <div className="text-xs text-gray-500 mt-0.5 capitalize">{item.type}</div>
                  </div>
                  <div className="font-semibold text-brand-300 whitespace-nowrap">{money(item.price * item.quantity)}</div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  {item.type === "part" ? (
                    <div className="flex items-center gap-1 border border-gray-700 rounded-md">
                      <button onClick={() => setQty(item.type, item.id, item.quantity - 1)} className="px-3 py-1 text-gray-300 hover:bg-gray-800">−</button>
                      <span className="w-10 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => setQty(item.type, item.id, item.quantity + 1)} className="px-3 py-1 text-gray-300 hover:bg-gray-800" disabled={item.maxQuantity != null && item.quantity >= item.maxQuantity}>+</button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">Qty 1 · unique device</span>
                  )}
                  <button onClick={() => remove(item.type, item.id)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                </div>
              </div>
            </div>

            {item.type === "phone" && (
              <div className="mt-4 border-t border-gray-800 pt-3">
                {item.daveCarePlan ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-400">✓</span>
                      <div>
                        <span className="font-medium text-white">Dave Care</span>
                        <span className="ml-2 text-xs text-gray-500">
                          {item.daveCarePlan === "monthly" ? `${money(DAVE_CARE_PRICES.monthly)}/mo` : `${money(DAVE_CARE_PRICES.annual)}/yr`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-brand-300">+{money(DAVE_CARE_PRICES[item.daveCarePlan])}</span>
                      <button onClick={() => pickPlan(item.id, null)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                    </div>
                  </div>
                ) : editingPlanFor === item.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => pickPlan(item.id, "annual")} className="text-xs btn-primary">Annual {money(DAVE_CARE_PRICES.annual)}</button>
                    <button onClick={() => pickPlan(item.id, "monthly")} className="text-xs btn-secondary">Monthly {money(DAVE_CARE_PRICES.monthly)}/mo</button>
                    <button onClick={() => setEditingPlanFor(null)} className="text-xs text-gray-500 hover:text-gray-300 ml-auto">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setEditingPlanFor(item.id)} className="text-sm text-brand-300 hover:text-brand-200">
                    + Add Dave Care protection
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <aside className="card p-5 h-fit sticky top-20">
        <h2 className="font-semibold text-white">Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-gray-400">Items ({count})</dt><dd className="font-medium">{money(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-400">Shipping</dt><dd className="text-gray-400">Calculated at checkout</dd></div>
          <div className="flex justify-between"><dt className="text-gray-400">Tax</dt><dd className="text-gray-400">Based on province</dd></div>
        </dl>
        {remaining > 0 && (
          <p className="mt-4 text-xs text-brand-300 bg-brand-900/30 border border-brand-800/50 rounded-md p-2">Add {money(remaining)} more for free shipping.</p>
        )}
        <Link href="/checkout" className="btn-primary w-full mt-5 justify-center">Continue to checkout</Link>
        <Link href="/inventory" className="block mt-3 text-center text-sm text-brand-300 hover:text-brand-200">← Continue shopping</Link>
      </aside>
    </div>
  );
}
