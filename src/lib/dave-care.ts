export const DAVE_CARE_PRICES = {
  monthly: 13.49,
  annual: 100.0
} as const;

export type DaveCarePlanType = keyof typeof DAVE_CARE_PRICES;

export type ClaimFlag = "batteryUsed" | "cameraUsed" | "screenUsed" | "backGlassUsed";

export const DAVE_CARE_BENEFITS: { key: string; label: string; flag: ClaimFlag }[] = [
  { key: "battery", label: "1 battery replacement", flag: "batteryUsed" },
  { key: "camera", label: "1 camera replacement", flag: "cameraUsed" },
  { key: "screen", label: "1 screen replacement", flag: "screenUsed" },
  { key: "backGlass", label: "1 back glass replacement", flag: "backGlassUsed" }
];

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
