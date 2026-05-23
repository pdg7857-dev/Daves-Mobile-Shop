export const DAVE_CARE_PRICES = {
  monthly: 13.49,
  annual: 97.0
} as const;

export type DaveCarePlanType = keyof typeof DAVE_CARE_PRICES;

export type ClaimFlag = "batteryUsed" | "cameraUsed" | "screenUsed" | "backGlassUsed";

export const DAVE_CARE_BENEFITS: { key: string; label: string; flag: ClaimFlag }[] = [
  { key: "screen", label: "1 free screen replacement", flag: "screenUsed" },
  { key: "battery", label: "1 free battery replacement", flag: "batteryUsed" },
  { key: "camera", label: "1 free camera replacement", flag: "cameraUsed" },
  { key: "backGlass", label: "1 free back glass replacement", flag: "backGlassUsed" }
];

export const DAVE_CARE_COVERAGE_PERIOD = "every 12 months";

export function annualEndsAt(start: Date): Date {
  const d = new Date(start);
  d.setFullYear(d.getFullYear() + 1);
  return d;
}

export function annualSavings(): number {
  return Math.round((DAVE_CARE_PRICES.monthly * 12 - DAVE_CARE_PRICES.annual) * 100) / 100;
}

export function priceFor(plan: DaveCarePlanType): number {
  return DAVE_CARE_PRICES[plan];
}

export function claimsRemaining(p: { batteryUsed: boolean; cameraUsed: boolean; screenUsed: boolean; backGlassUsed: boolean }): number {
  return [p.batteryUsed, p.cameraUsed, p.screenUsed, p.backGlassUsed].filter((u) => !u).length;
}

// Warranty terms advertised across the site
export const WARRANTY = {
  phoneDays: 180,
  repairDays: 90,
  phoneLabel: "180-day warranty",
  repairLabel: "90-day workmanship warranty"
} as const;
