import { prisma } from "./db";

// Compute the next time a recurring task should fire, starting from `after`.
// We pick the next occurrence that is strictly > after, honoring the chosen
// frequency, interval, and (for WEEKLY) the allowed days-of-week.
export function computeNextDueDate(
  frequency: string,
  intervalCount: number,
  daysOfWeek: number[],
  dayOfMonth: number | null,
  after: Date,
): Date {
  const start = new Date(after);
  start.setHours(9, 0, 0, 0); // default fire time: 09:00

  if (frequency === "DAILY") {
    const next = new Date(start);
    next.setDate(next.getDate() + Math.max(1, intervalCount));
    return next;
  }

  if (frequency === "WEEKLY") {
    const allowed = daysOfWeek.length ? daysOfWeek : [start.getDay()];
    // Look forward up to 14 days for the next allowed weekday.
    for (let i = 1; i <= 14; i++) {
      const candidate = new Date(start);
      candidate.setDate(candidate.getDate() + i);
      if (allowed.includes(candidate.getDay())) return candidate;
    }
    const fallback = new Date(start);
    fallback.setDate(fallback.getDate() + 7 * Math.max(1, intervalCount));
    return fallback;
  }

  if (frequency === "MONTHLY") {
    const next = new Date(start);
    next.setMonth(next.getMonth() + Math.max(1, intervalCount));
    if (dayOfMonth) next.setDate(Math.min(dayOfMonth, daysInMonth(next)));
    return next;
  }

  // Unknown frequency — default to +1 day to avoid infinite spawning.
  const fallback = new Date(start);
  fallback.setDate(fallback.getDate() + 1);
  return fallback;
}

function daysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

export async function spawnDueRecurringTasks(): Promise<number> {
  const now = new Date();
  const due = await prisma.recurringTask.findMany({
    where: { active: true, nextDueDate: { lte: now } },
  });

  let spawned = 0;
  for (const r of due) {
    // Defensive cap: if a task is far behind (sync was down for weeks), spawn
    // at most one occurrence per run to avoid flooding the inbox.
    await prisma.task.create({
      data: {
        title: r.title,
        description: r.description,
        priority: r.priority,
        source: "PERSONAL",
        dueDate: r.nextDueDate,
        recurringTaskId: r.id,
        status: "open",
      },
    });
    const next = computeNextDueDate(
      r.frequency,
      r.intervalCount,
      r.daysOfWeek,
      r.dayOfMonth,
      r.nextDueDate,
    );
    await prisma.recurringTask.update({
      where: { id: r.id },
      data: { nextDueDate: next, lastSpawnedAt: now },
    });
    spawned++;
  }
  return spawned;
}
