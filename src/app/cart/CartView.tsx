"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { money } from "@/lib/format";
import { DAVE_CARE_PRICES, type DaveCarePlanType } from "@/lib/dave-care";
import DaveCarePopup from "@/components/DaveCarePopup";

export default function CartView({ freeShippingThreshold }: { freeShippingThreshold: number | null }) {
  const { items, setQty, remove, setDaveCarePlan, subtotal, hydrated, count } = useCart();
  const router = useRouter();
  const [editingPlanFor, setEditingPlanFor] = useState<number | null>(null);
  // Stack of unprotected phones to walk the customer through before checkout
  const [reminderQueue, setReminderQueue] = useState<number[] | null>(null);

  if (!hydrated) {
    return <div className="mt-6 text-white/55">Loading…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 card p-12 text-center">
        <p className="text-white/65">Your cart is empty.</p>
        <div className="mt-6 flex gap-3 justify-center">
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

  function startCheckout() {
    const unprotectedPhones = items
      .filter((i) => i.type === "phone" && !i.daveCarePlan)
      .map((i) => i.id);
    if (unprotectedPhones.length === 0) {
      router.push("/checkout");
      return;
    }
    setReminderQueue(unprotectedPhones);
  }

  // Handle a reminder choice. After the last phone, jump to checkout.
  function reminderChoose(plan: DaveCarePlanType | null) {
    if (!reminderQueue || reminderQueue.length === 0) return;
    const [head, ...rest] = reminderQueue;
    if (plan) setDaveCarePlan(head, plan);
    if (rest.length === 0) {
      setReminderQueue(null);
      router.push("/checkout");
    } else {
      setReminderQueue(rest);
    }
  }

  const currentReminderPhone =
    reminderQueue && reminderQueue.length > 0
      ? items.find((i) => i.type === "phone" && i.id === reminderQueue[0])
      : null;

  return (
    <div className="mt-6 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-3">
        {items.map((item) => (
          <div key={`${item.type}-${item.id}`} className="card p-5">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-xl bg-[#2a2a2d] flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="opacity-50">{item.type === "phone" ? "📱" : "🔧"}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={item.type === "phone" ? `/inventory/${item.id}` : `/parts/${item.id}`} className="font-semibold text-white hover:text-[color:var(--apple-blue)] tracking-tight">{item.name}</Link>
                    <div className="text-[12px] text-white/45 mt-0.5 capitalize">{item.type}</div>
                  </div>
                  <div className="font-semibold text-white tracking-tight whitespace-nowrap">{money(item.price * item.quantity)}</div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  {item.type === "part" ? (
                    <div className="flex items-center gap-1 border border-white/10 rounded-full">
                      <button onClick={() => setQty(item.type, item.id, item.quantity - 1)} className="px-3 py-1 text-white/70 hover:bg-white/[0.06] rounded-l-full">−</button>
                      <span className="w-10 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => setQty(item.type, item.id, item.quantity + 1)} className="px-3 py-1 text-white/70 hover:bg-white/[0.06] rounded-r-full" disabled={item.maxQuantity != null && item.quantity >= item.maxQuantity}>+</button>
                    </div>
                  ) : (
                    <span className="text-[12px] text-white/45">Qty 1 · unique device</span>
                  )}
                  <button onClick={() => remove(item.type, item.id)} className="text-[12px] text-red-400 hover:text-red-300">Remove</button>
                </div>
              </div>
            </div>

            {item.type === "phone" && (
              <div className="mt-4 border-t border-white/[0.06] pt-4">
                {item.daveCarePlan ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-emerald-400">✓</span>
                      <div>
                        <span className="font-medium text-white">Dave Care protection</span>
                        <span className="ml-2 text-[12px] text-white/55">
                          {item.daveCarePlan === "monthly" ? `${money(DAVE_CARE_PRICES.monthly)}/mo` : `${money(DAVE_CARE_PRICES.annual)}/yr`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">+{money(DAVE_CARE_PRICES[item.daveCarePlan])}</span>
                      <button onClick={() => pickPlan(item.id, null)} className="text-[12px] text-red-400 hover:text-red-300">Remove</button>
                    </div>
                  </div>
                ) : editingPlanFor === item.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => pickPlan(item.id, "annual")} className="text-xs btn-primary">Annual {money(DAVE_CARE_PRICES.annual)}</button>
                    <button onClick={() => pickPlan(item.id, "monthly")} className="text-xs btn-secondary">Monthly {money(DAVE_CARE_PRICES.monthly)}/mo</button>
                    <button onClick={() => setEditingPlanFor(null)} className="text-xs text-white/45 hover:text-white/70 ml-auto">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setEditingPlanFor(item.id)} className="text-sm text-[color:var(--apple-blue)] hover:underline">
                    + Add Dave Care protection
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <aside className="card p-6 h-fit sticky top-20">
        <h2 className="font-semibold text-white tracking-tight">Summary</h2>
        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex justify-between"><dt className="text-white/55">Items ({count})</dt><dd className="font-medium text-white">{money(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-white/55">Shipping</dt><dd className="text-white/55">Calculated at checkout</dd></div>
          <div className="flex justify-between"><dt className="text-white/55">Tax</dt><dd className="text-white/55">Based on province</dd></div>
        </dl>
        {remaining > 0 && (
          <p className="mt-4 text-[12px] text-[color:var(--apple-blue)] bg-[color:var(--apple-blue)]/10 border border-[color:var(--apple-blue)]/30 rounded-xl p-3">Add {money(remaining)} more for free shipping.</p>
        )}
        <button onClick={startCheckout} className="btn-primary w-full mt-5 justify-center">Continue to checkout</button>
        <Link href="/inventory" className="block mt-3 text-center text-sm text-[color:var(--apple-blue)] hover:underline">← Continue shopping</Link>
      </aside>

      {currentReminderPhone && (
        <DaveCarePopup
          phoneLabel={currentReminderPhone.name}
          onChoose={reminderChoose}
          onClose={() => setReminderQueue(null)}
          reminderMode
        />
      )}
    </div>
  );
}
