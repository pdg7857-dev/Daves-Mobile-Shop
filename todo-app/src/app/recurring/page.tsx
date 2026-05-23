import Link from "next/link";
import { prisma } from "@/lib/db";
import { RecurringRow } from "@/components/RecurringRow";

export const dynamic = "force-dynamic";

export default async function RecurringPage() {
  const items = await prisma.recurringTask.findMany({
    orderBy: [{ active: "desc" }, { nextDueDate: "asc" }],
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Recurring tasks</h1>
        <Link href="/recurring/new" className="btn-primary">New recurring task</Link>
      </div>
      {items.length === 0 ? (
        <div className="card text-center text-sub">
          No recurring tasks yet. <Link href="/recurring/new" className="text-accent hover:underline">Create one</Link>.
        </div>
      ) : (
        items.map((r) => <RecurringRow key={r.id} item={{ ...r, startDate: r.startDate.toISOString(), nextDueDate: r.nextDueDate.toISOString(), lastSpawnedAt: r.lastSpawnedAt?.toISOString() ?? null }} />)
      )}
    </div>
  );
}
