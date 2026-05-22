import { prisma } from "./db";

export type ShippingConfig = {
  flatRate: number;
  freeShippingThreshold: number | null;
};

export async function getSettings() {
  // Upsert pattern keeps the single-row contract race-safe on cold start.
  return prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, shippingFlatRate: 15, freeShippingThreshold: null }
  });
}

export async function getShippingConfig(): Promise<ShippingConfig> {
  const s = await getSettings();
  return {
    flatRate: s.flatRate ?? s.shippingFlatRate,
    freeShippingThreshold: s.freeShippingThreshold
  };
}
