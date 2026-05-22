import type { ShippingConfig } from "./settings";

export type Province = {
  code: string;
  name: string;
  taxRate: number;
  taxLabel: string;
};

export const PROVINCES: Province[] = [
  { code: "AB", name: "Alberta", taxRate: 0.05, taxLabel: "GST 5%" },
  { code: "BC", name: "British Columbia", taxRate: 0.12, taxLabel: "GST + PST 12%" },
  { code: "MB", name: "Manitoba", taxRate: 0.12, taxLabel: "GST + PST 12%" },
  { code: "NB", name: "New Brunswick", taxRate: 0.15, taxLabel: "HST 15%" },
  { code: "NL", name: "Newfoundland and Labrador", taxRate: 0.15, taxLabel: "HST 15%" },
  { code: "NS", name: "Nova Scotia", taxRate: 0.15, taxLabel: "HST 15%" },
  { code: "NT", name: "Northwest Territories", taxRate: 0.05, taxLabel: "GST 5%" },
  { code: "NU", name: "Nunavut", taxRate: 0.05, taxLabel: "GST 5%" },
  { code: "ON", name: "Ontario", taxRate: 0.13, taxLabel: "HST 13%" },
  { code: "PE", name: "Prince Edward Island", taxRate: 0.15, taxLabel: "HST 15%" },
  { code: "QC", name: "Quebec", taxRate: 0.14975, taxLabel: "GST + QST 14.975%" },
  { code: "SK", name: "Saskatchewan", taxRate: 0.11, taxLabel: "GST + PST 11%" },
  { code: "YT", name: "Yukon", taxRate: 0.05, taxLabel: "GST 5%" }
];

export function getProvince(code: string): Province | undefined {
  return PROVINCES.find((p) => p.code === code);
}

export function shippingFor(subtotal: number, config: ShippingConfig): number {
  if (config.freeShippingThreshold != null && subtotal >= config.freeShippingThreshold) {
    return 0;
  }
  return config.flatRate;
}

export function calculateTotals(
  subtotal: number,
  province: string,
  config: ShippingConfig,
  discountAmount = 0
) {
  const discounted = Math.max(0, subtotal - discountAmount);
  const shippingCost = shippingFor(discounted, config);
  const rate = getProvince(province)?.taxRate ?? 0.13;
  const taxableAmount = discounted + shippingCost;
  const taxAmount = round2(taxableAmount * rate);
  const total = round2(discounted + shippingCost + taxAmount);
  return {
    subtotal: round2(subtotal),
    discountAmount: round2(discountAmount),
    shippingCost,
    taxRate: rate,
    taxAmount,
    total
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function isValidPostalCode(value: string): boolean {
  return /^[A-CEGHJ-NPRSTVXY]\d[A-CEGHJ-NPRSTV-Z][ -]?\d[A-CEGHJ-NPRSTV-Z]\d$/i.test(value.trim());
}
