"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { money } from "@/lib/format";
import { FREE_SHIPPING_AT } from "@/lib/shipping";

export default function CartView() {
  const { items, setQty, remove, subtotal, hydrated, count } = useCart();

  if (!hydrated) {
    return <div className="mt-6 text-gray-500">Loading…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 card p-10 text-center">
        <p className="text-gray-600">Your cart is empty.</p>
        <div className="mt-4 flex gap-3 justify-center">
          <Link href="/inventory" className="btn-primary">Shop phones</Link>
          <Link href="/parts" className="btn-secondary">Shop parts</Link>
        </div>
      </div>
    );
  }

  const remaining = FREE_SHIPPING_AT - subtotal;

  return (
    <div className="mt-6 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-3">
        {items.map((item) => (
          <div key={`${item.type}-${item.id}`} className="card p-4 flex gap-4">
            <div className="w-20 h-20 rounded bg-gray-100 flex items-center justify-center text-3xl shrink-0">
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
                  <Link
                    href={item.type === "phone" ? `/inventory/${item.id}` : `/parts/${item.id}`}
                    className="font-medium text-gray-900 hover:text-brand-700"
                  >
                    {item.name}
                  </Link>
                  <div className="text-xs text-gray-500 mt-0.5 capitalize">{item.type}</div>
                </div>
                <div className="font-semibold text-brand-700 whitespace-nowrap">
                  {money(item.price * item.quantity)}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                {item.type === "part" ? (
                  <div className="flex items-center gap-1 border border-gray-300 rounded-md">
                    <button
                      onClick={() => setQty(item.type, item.id, item.quantity - 1)}
                      className="px-3 py-1 text-gray-700 hover:bg-gray-50"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => setQty(item.type, item.id, item.quantity + 1)}
                      className="px-3 py-1 text-gray-700 hover:bg-gray-50"
                      disabled={item.maxQuantity != null && item.quantity >= item.maxQuantity}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">Qty 1 · unique device</span>
                )}
                <button
                  onClick={() => remove(item.type, item.id)}
                  className="text-xs text-red-700 hover:text-red-900"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="card p-5 h-fit sticky top-20">
        <h2 className="font-semibold text-gray-900">Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Items ({count})</dt>
            <dd className="font-medium">{money(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Shipping</dt>
            <dd className="text-gray-600">Calculated at checkout</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Tax</dt>
            <dd className="text-gray-600">Based on province</dd>
          </div>
        </dl>
        {remaining > 0 && (
          <p className="mt-4 text-xs text-brand-700 bg-brand-50 border border-brand-100 rounded-md p-2">
            Add {money(remaining)} more for free shipping.
          </p>
        )}
        <Link href="/checkout" className="btn-primary w-full mt-5 justify-center">
          Continue to checkout
        </Link>
        <Link href="/inventory" className="block mt-3 text-center text-sm text-brand-700 hover:text-brand-900">
          ← Continue shopping
        </Link>
      </aside>
    </div>
  );
}
