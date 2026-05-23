"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "./CartProvider";

type Props = {
  item: Omit<CartItem, "quantity">;
  defaultQuantity?: number;
  allowQuantity?: boolean;
  disabled?: boolean;
  label?: string;
};

export default function AddToCartButton({
  item,
  defaultQuantity = 1,
  allowQuantity = false,
  disabled = false,
  label = "Add to cart"
}: Props) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(defaultQuantity);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    add({ ...item, quantity: qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function buyNow() {
    add({ ...item, quantity: qty });
    router.push("/cart");
  }

  if (disabled) {
    return (
      <button disabled className="btn bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700">
        Unavailable
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {allowQuantity && (
        <div className="flex items-center gap-1 border border-gray-700 rounded-md">
          <button
            type="button"
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="px-3 py-2 text-gray-300 hover:bg-gray-800"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-medium">{qty}</span>
          <button
            type="button"
            onClick={() => setQty(Math.min((item.maxQuantity ?? 99), qty + 1))}
            className="px-3 py-2 text-gray-300 hover:bg-gray-800"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      )}
      <button onClick={handleAdd} className="btn-secondary">
        {added ? "✓ Added" : label}
      </button>
      <button onClick={buyNow} className="btn-primary">
        Buy now
      </button>
    </div>
  );
}
