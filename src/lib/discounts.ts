import type { DiscountCode } from "@prisma/client";

export const DISCOUNT_TYPES = ["percentage", "fixed"] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export type DiscountApplication =
  | { ok: true; discount: DiscountCode; amount: number }
  | { ok: false; reason: string };

export function applyDiscount(code: DiscountCode | null, subtotal: number): DiscountApplication {
  if (!code) return { ok: false, reason: "Code not found" };
  if (!code.active) return { ok: false, reason: "This code is inactive" };
  if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
    return { ok: false, reason: "This code has expired" };
  }
  if (code.maxUses != null && code.usedCount >= code.maxUses) {
    return { ok: false, reason: "This code has reached its usage limit" };
  }
  if (code.minOrderAmount != null && subtotal < code.minOrderAmount) {
    return {
      ok: false,
      reason: `Order subtotal must be at least $${code.minOrderAmount.toFixed(2)} to use this code`
    };
  }

  let amount = 0;
  if (code.discountType === "percentage") {
    amount = subtotal * (code.discountValue / 100);
  } else if (code.discountType === "fixed") {
    amount = code.discountValue;
  } else {
    return { ok: false, reason: "Unknown discount type" };
  }
  amount = Math.min(amount, subtotal);
  amount = Math.round(amount * 100) / 100;

  return { ok: true, discount: code, amount };
}
