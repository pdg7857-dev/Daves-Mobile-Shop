"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DAVE_CARE_PRICES, type DaveCarePlanType } from "@/lib/dave-care";

export type CartItem = {
  type: "phone" | "part";
  id: number;
  name: string;
  imageUrl?: string | null;
  price: number;
  quantity: number;
  maxQuantity?: number;
  daveCarePlan?: DaveCarePlanType | null;
};

type CartContextValue = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (type: "phone" | "part", id: number) => void;
  setQty: (type: "phone" | "part", id: number, qty: number) => void;
  setDaveCarePlan: (id: number, plan: DaveCarePlanType | null) => void;
  clear: () => void;
  subtotal: number;
  count: number;
  hydrated: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "dms_cart_v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.type === item.type && p.id === item.id);
      if (existing) {
        if (item.type === "phone") return prev;
        const max = item.maxQuantity ?? existing.maxQuantity ?? 999;
        return prev.map((p) =>
          p.type === item.type && p.id === item.id
            ? { ...p, quantity: Math.min(p.quantity + item.quantity, max), maxQuantity: max }
            : p
        );
      }
      return [...prev, item];
    });
  }, []);

  const remove = useCallback((type: "phone" | "part", id: number) => {
    setItems((prev) => prev.filter((p) => !(p.type === type && p.id === id)));
  }, []);

  const setQty = useCallback((type: "phone" | "part", id: number, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((p) => !(p.type === type && p.id === id));
      return prev.map((p) =>
        p.type === type && p.id === id
          ? { ...p, quantity: Math.min(qty, p.maxQuantity ?? 999) }
          : p
      );
    });
  }, []);

  const setDaveCarePlan = useCallback((id: number, plan: DaveCarePlanType | null) => {
    setItems((prev) => prev.map((p) => (p.type === "phone" && p.id === id ? { ...p, daveCarePlan: plan } : p)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const subtotal = items.reduce((sum, i) => {
    const base = i.price * i.quantity;
    const addon = i.type === "phone" && i.daveCarePlan ? DAVE_CARE_PRICES[i.daveCarePlan] : 0;
    return sum + base + addon;
  }, 0);
  const count = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, setQty, setDaveCarePlan, clear, subtotal, count, hydrated }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
