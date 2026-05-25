import { prisma } from "@/lib/db";
import BroadcastForm from "./BroadcastForm";

export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return d.toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" });
}

export default async function AdminSmsPage() {
  const [eligibleCount, recentLogs, recentBroadcasts] = await Promise.all([
    // Distinct opted-in phone numbers, not unsubscribed
    prisma.order.findMany({
      where: {
        smsOptIn: true,
        customerPhone: { not: null },
        marketingUnsubscribedAt: null
      },
      select: { customerPhone: true },
      distinct: ["customerPhone"]
    }),
    prisma.smsLog.findMany({
      orderBy: { sentAt: "desc" },
      take: 30
    }),
    // Group broadcasts by broadcastId
    prisma.smsLog.groupBy({
      by: ["broadcastId"],
      where: { broadcastId: { not: null }, campaign: "broadcast" },
      _count: { _all: true },
      _max: { sentAt: true },
      orderBy: { _max: { sentAt: "desc" } },
      take: 10
    })
  ]);

  return (
    <div>
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SMS Broadcasts</h1>
          <p className="text-sm text-gray-600">
            Send a marketing or restock message to all opted-in customers.
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-brand-700">{eligibleCount.length}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wide">opted-in numbers</div>
        </div>
      </header>

      <div className="mt-6">
        <BroadcastForm recipientCount={eligibleCount.length} />
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <h2 className="font-semibold text-gray-900">Recent broadcasts</h2>
          {recentBroadcasts.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No broadcasts yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-gray-100">
              {recentBroadcasts.map((b) => (
                <li key={b.broadcastId} className="py-2 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-mono text-xs text-gray-600">{b.broadcastId?.slice(0, 12)}…</div>
                    <div className="text-xs text-gray-500">{b._max.sentAt ? fmt(b._max.sentAt) : ""}</div>
                  </div>
                  <span className="text-xs rounded-full bg-brand-100 text-brand-800 px-2 py-0.5">
                    {b._count._all} sent
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-4">
          <h2 className="font-semibold text-gray-900">Recent messages</h2>
          {recentLogs.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No SMS activity yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {recentLogs.map((log) => (
                <li key={log.id} className="py-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-mono ${log.direction === "in" ? "text-emerald-700" : "text-gray-600"}`}>
                      {log.direction === "in" ? "← IN " : "→ OUT"}
                    </span>
                    <span className="text-xs text-gray-500">{fmt(log.sentAt)}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-700">
                    {log.direction === "in" ? log.fromNumber : log.toNumber}
                    {log.campaign && <span className="ml-2 text-gray-400">· {log.campaign}</span>}
                  </div>
                  <p className="mt-1 text-xs text-gray-800 line-clamp-2">{log.body}</p>
                  {log.error && <p className="text-xs text-red-600 mt-0.5">{log.error}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
