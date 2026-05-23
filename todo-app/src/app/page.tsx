import Link from "next/link";
import { prisma } from "@/lib/db";
import { PRIORITY_RANK, SOURCE, SOURCE_LABEL, type Source } from "@/lib/sources";
import { TaskRow } from "@/components/TaskRow";
import { SyncButton } from "@/components/SyncButton";

export const dynamic = "force-dynamic";

type Filter = "all" | "personal" | "shop" | "toyota" | "done";

function filterToWhere(filter: Filter) {
  if (filter === "done") return { status: { in: ["done", "dismissed"] } };
  const base = { status: { in: ["open", "snoozed"] } };
  if (filter === "personal") return { ...base, source: SOURCE.PERSONAL };
  if (filter === "shop")
    return { ...base, source: { in: [SOURCE.MOBILE_SHOP_ORDER, SOURCE.MOBILE_SHOP_CARE_PLAN] } };
  if (filter === "toyota") return { ...base, source: SOURCE.TOYOTA_LEAD };
  return base;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const filter = (params?.filter ?? "all") as Filter;

  const [tasks, lastRuns] = await Promise.all([
    prisma.task.findMany({
      where: filterToWhere(filter),
      orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
      take: 250,
    }),
    prisma.syncRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 4,
      distinct: ["source"],
    }),
  ]);

  // Stable secondary sort by priority rank inside the page (Prisma can't sort on
  // an arbitrary mapping, so we do it here).
  tasks.sort((a, b) => {
    const ra = PRIORITY_RANK[a.priority] ?? 99;
    const rb = PRIORITY_RANK[b.priority] ?? 99;
    if (ra !== rb) return ra - rb;
    return 0;
  });

  const grouped = new Map<Source, typeof tasks>();
  for (const t of tasks) {
    const key = t.source as Source;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(t);
  }
  const groupOrder: Source[] = [
    SOURCE.PERSONAL,
    SOURCE.MOBILE_SHOP_ORDER,
    SOURCE.MOBILE_SHOP_CARE_PLAN,
    SOURCE.TOYOTA_LEAD,
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(["all", "personal", "shop", "toyota", "done"] as Filter[]).map((f) => (
            <Link
              key={f}
              href={`/?filter=${f}`}
              className={`chip ${f === filter ? "ring-accent/40 bg-accent/10 text-accent" : "ring-line bg-muted text-sub hover:text-ink"}`}
            >
              {f === "all" ? "All open" : f === "shop" ? "Mobile shop" : f === "done" ? "Completed" : f.charAt(0).toUpperCase() + f.slice(1)}
            </Link>
          ))}
        </div>
        <SyncButton />
      </section>

      {lastRuns.length > 0 && (
        <section className="text-xs text-sub">
          {lastRuns.map((r) => (
            <span key={r.id} className="mr-3">
              {r.source}: {r.status} {r.completedAt ? `at ${new Date(r.completedAt).toLocaleString()}` : ""}
              {r.errorMessage ? ` — ${r.errorMessage}` : ""}
            </span>
          ))}
        </section>
      )}

      {tasks.length === 0 ? (
        <div className="card text-center text-sub">
          No tasks here. Click <span className="text-ink">Sync now</span> to pull from the mobile shop and Toyota, or{" "}
          <Link href="/personal/new" className="text-accent hover:underline">add a personal task</Link>.
        </div>
      ) : (
        groupOrder
          .filter((g) => grouped.has(g))
          .map((g) => (
            <section key={g} className="flex flex-col gap-2">
              <h2 className="text-xs uppercase tracking-wide text-sub">
                {SOURCE_LABEL[g]} <span className="text-line">·</span> {grouped.get(g)!.length}
              </h2>
              <div className="flex flex-col gap-2">
                {grouped.get(g)!.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </div>
            </section>
          ))
      )}
    </div>
  );
}
