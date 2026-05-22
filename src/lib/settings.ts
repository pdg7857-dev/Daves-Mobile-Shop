import { prisma } from "./db";

export type ShippingConfig = {
  flatRate: number;
  freeShippingThreshold: number | null;
};

export async function getSettings() {
  // Read-then-upsert: avoids bumping `updatedAt` on every page load (Prisma
  // would emit an UPDATE even when `update: {}`). Cold-start race is still
  // handled by upsert at the end.
  const existing = await prisma.settings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, shippingFlatRate: 15, freeShippingThreshold: null }
  });
}

export async function getShippingConfig(): Promise<ShippingConfig> {
  const s = await getSettings();
  return {
    flatRate: s.shippingFlatRate,
    freeShippingThreshold: s.freeShippingThreshold
  };
}
