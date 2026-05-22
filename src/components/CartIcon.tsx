"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function CartIcon() {
  const { count, hydrated } = useCart();
  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
      aria-label={`Cart (${count} items)`}
    >
      <span className="text-xl">🛒</span>
      {hydrated && count > 0 && (
        <span className="absolute -top-1 -right-1 rounded-full bg-brand-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}
