import { prisma } from "./db";

export type ShippingConfig = {
  flatRate: number;
  freeShippingThreshold: number | null;
};

export async function getSettings() {
  const existing = await prisma.settings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.settings.create({
    data: { id: 1, shippingFlatRate: 15, freeShippingThreshold: null }
  });
}

export async function getShippingConfig(): Promise<ShippingConfig> {
  const s = await getSettings();
  return {
    flatRate: s.shippingFlatRate,
    freeShippingThreshold: s.freeShippingThreshold
  };
}
