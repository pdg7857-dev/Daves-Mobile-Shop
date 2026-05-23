import { prisma } from "./db";
import { syncMobileShop, type SyncResult } from "./mobile-shop";
import { syncToyota } from "./toyota";
import { spawnDueRecurringTasks } from "./recurrence";

async function recordRun<T extends SyncResult>(
  source: string,
  fn: () => Promise<T>,
): Promise<{ ok: true; result: T } | { ok: false; error: string }> {
  const run = await prisma.syncRun.create({ data: { source, status: "running" } });
  try {
    const result = await fn();
    await prisma.syncRun.update({
      where: { id: run.id },
      data: {
        status: "success",
        completedAt: new Date(),
        itemsAdded: result.added,
        itemsUpdated: result.updated,
        itemsClosed: result.closed,
      },
    });
    return { ok: true, result };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await prisma.syncRun.update({
      where: { id: run.id },
      data: { status: "error", completedAt: new Date(), errorMessage: message },
    });
    return { ok: false, error: message };
  }
}

export type SyncAllReport = {
  mobileShop: { ok: boolean; result?: SyncResult; error?: string };
  toyota: { ok: boolean; result?: SyncResult; error?: string };
  recurringSpawned: number;
};

export async function syncAll(): Promise<SyncAllReport> {
  const [mobileShop, toyota] = await Promise.all([
    recordRun("MOBILE_SHOP", syncMobileShop),
    recordRun("TOYOTA", syncToyota),
  ]);
  const recurringSpawned = await spawnDueRecurringTasks();
  return {
    mobileShop: mobileShop.ok ? { ok: true, result: mobileShop.result } : { ok: false, error: mobileShop.error },
    toyota: toyota.ok ? { ok: true, result: toyota.result } : { ok: false, error: toyota.error },
    recurringSpawned,
  };
}
