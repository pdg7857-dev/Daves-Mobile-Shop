"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function CartIcon() {
  const { count, hydrated } = useCart();
  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center rounded-md w-11 h-11 text-gray-300 hover:bg-gray-800 active:scale-95 transition-transform"
      aria-label={`Cart (${count} items)`}
    >
      <span className="text-xl">🛒</span>
      {hydrated && count > 0 && (
        <span className="absolute top-1 right-1 rounded-full bg-brand-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}
