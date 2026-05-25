import Link from "next/link";
import { prisma } from "@/lib/db";
import { money, date } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLOR, type OrderStatus } from "@/lib/orders";
import { summarize, type Range } from "@/lib/analytics";
import DemoDataButton from "./DemoDataButton";

export const dynamic = "force-dynamic";

type SearchParams = { range?: string };

function fmtPct(n: number): string {
  if (n > 0) return `+${n}%`;
  return `${n}%`;
}

function deltaColor(n: number): string {
  if (n > 0) return "text-emerald-700";
  if (n < 0) return "text-red-700";
  return "text-gray-500";
}

function StatCard({
  label,
  value,
  delta,
  hint
}: {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
}) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wide text-gray-600">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 flex items-center gap-2 text-xs">
        {delta !== undefined && (
          <span className={`font-medium ${deltaColor(delta)}`}>{fmtPct(delta)}</span>
        )}
        {hint && <span className="text-gray-500">{hint}</span>}
      </p>
    </div>
  );
}

function MiniChart({
  data,
  height = 80,
  color = "#0071e3"
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const barWidth = 100 / data.length;
  return (
    <div>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        {data.map((d, i) => {
          const h = (d.value / max) * height;
          return (
            <rect
              key={i}
              x={i * barWidth + 0.5}
              y={height - h}
              width={barWidth - 1}
              height={h}
              fill={color}
              opacity={0.75}
            >
              <title>{`${d.label}: ${d.value}`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-gray-500">
        <span>{data[0]?.label}</span>
        <span>{data[Math.floor(data.length / 2)]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

function RankList({
  title,
  items,
  hrefBase
}: {
  title: string;
  items: { name: string; count: number }[];
  hrefBase?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="card p-4">
      <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-gray-500">No data yet.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.name} className="relative">
              <div
                className="absolute left-0 top-0 h-full rounded bg-brand-50"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
              <div className="relative flex justify-between items-center px-2 py-1">
                {hrefBase ? (
                  <Link href={`${hrefBase}${item.name}`} className="text-gray-800 truncate hover:text-brand-700">
                    {item.name}
                  </Link>
                ) : (
                  <span className="text-gray-800 truncate">{item.name}</span>
                )}
                <span className="text-xs font-medium text-gray-600 shrink-0 ml-2">{item.count}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const range: Range = sp.range === "day" || sp.range === "month" ? sp.range : "week";

  const [stats, forSale, inRepair, reserved, sold, partsCount, pendingOrders, paidOrders, activePlans, lowStock, recentOrders] =
    await Promise.all([
      summarize(range),
      prisma.phone.count({ where: { status: "for_sale" } }),
      prisma.phone.count({ where: { status: "in_repair" } }),
      prisma.phone.count({ where: { status: "reserved" } }),
      prisma.phone.count({ where: { status: "sold" } }),
      prisma.part.count(),
      prisma.order.count({ where: { status: "pending_payment" } }),
      prisma.order.count({ where: { status: { in: ["paid", "processing"] } } }),
      prisma.daveCarePlan.count({ where: { status: "active" } }),
      prisma.part.findMany({ where: { stock: { lte: 3 } }, orderBy: { stock: "asc" }, take: 5 }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 })
    ]);

  const conv = stats.visitors > 0 ? Math.round((stats.purchase / stats.visitors) * 10000) / 100 : 0;
  const aov = stats.orderCount > 0 ? stats.revenue / stats.orderCount : 0;

  function rangeBtn(r: Range, label: string) {
    const active = range === r;
    return (
      <Link
        href={`/admin/dashboard?range=${r}`}
        className={`text-xs px-3 py-1.5 rounded-full ${
          active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        {label}
      </Link>
    );
  }

  return (
    <div>
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">Traffic, sales, and conversion at a glance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 mr-2">
            {rangeBtn("day", "Last 24h")}
            {rangeBtn("week", "Last 7 days")}
            {rangeBtn("month", "Last 30 days")}
          </div>
          <Link href="/admin/inventory/new" className="btn-primary">+ Add phone</Link>
          <DemoDataButton />
        </div>
      </header>

      {/* ===== Top stat cards ===== */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Visitors" value={stats.visitors.toLocaleString()} delta={stats.visitorsDelta} hint="vs previous" />
        <StatCard label="Pageviews" value={stats.pageviews.toLocaleString()} delta={stats.pageviewsDelta} hint="vs previous" />
        <StatCard label="Revenue" value={money(stats.revenue)} delta={stats.revenueDelta} hint="vs previous" />
        <StatCard label="Orders" value={String(stats.orderCount)} delta={stats.orderCountDelta} hint={`avg ${money(aov)}`} />
      </div>

      {/* ===== Chart row ===== */}
      <div className="mt-6 grid lg:grid-cols-2 gap-3">
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 text-sm">Pageviews over time</h3>
          <div className="mt-3">
            <MiniChart data={stats.chart.map((c) => ({ label: c.label, value: c.pageviews }))} color="#0071e3" />
          </div>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 text-sm">Revenue over time</h3>
          <div className="mt-3">
            <MiniChart data={stats.chart.map((c) => ({ label: c.label, value: c.revenue }))} color="#22c55e" />
          </div>
        </div>
      </div>

      {/* ===== Conversion funnel ===== */}
      <div className="mt-6 card p-4">
        <h3 className="font-semibold text-gray-900 text-sm">Conversion funnel</h3>
        <p className="mt-1 text-xs text-gray-500">Overall conversion: <strong>{conv}%</strong> · AOV: <strong>{money(aov)}</strong></p>
        <div className="mt-4 space-y-2">
          {stats.funnel.map((f, i) => {
            const widthPct = Math.max(2, f.rate);
            return (
              <div key={f.stage}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">{i + 1}. {f.stage}</span>
                  <span className="text-gray-600">
                    <strong>{f.count.toLocaleString()}</strong>
                    <span className="text-gray-400 ml-2">({f.rate.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== Pages + Geo ===== */}
      <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        <RankList title="Top pages" items={stats.topPages.map((p) => ({ name: p.path, count: p.count }))} />
        <RankList title="Top landing pages" items={stats.landingPages.map((p) => ({ name: p.path, count: p.count }))} />
        <RankList title="Devices" items={stats.devices} />
        <RankList title="By country" items={stats.countries} />
        <RankList title="By province / region" items={stats.regions} />
        <RankList title="By city" items={stats.cities} />
      </div>

      {/* ===== Operational snapshot ===== */}
      <h2 className="mt-10 text-lg font-bold text-gray-900">Operations</h2>
      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link href="/admin/orders?status=pending_payment" className="card p-3 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-amber-700">{pendingOrders}</div>
          <div className="text-[10px] text-gray-600 uppercase tracking-wide mt-1">Pending payment</div>
        </Link>
        <Link href="/admin/orders?status=paid" className="card p-3 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-blue-700">{paidOrders}</div>
          <div className="text-[10px] text-gray-600 uppercase tracking-wide mt-1">To ship</div>
        </Link>
        <Link href="/admin/inventory?status=for_sale" className="card p-3 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-green-700">{forSale}</div>
          <div className="text-[10px] text-gray-600 uppercase tracking-wide mt-1">For sale</div>
        </Link>
        <Link href="/admin/dave-care?status=active" className="card p-3 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-emerald-700">{activePlans}</div>
          <div className="text-[10px] text-gray-600 uppercase tracking-wide mt-1">Dave Care</div>
        </Link>
        <Link href="/admin/inventory?status=in_repair" className="card p-3 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-purple-700">{inRepair}</div>
          <div className="text-[10px] text-gray-600 uppercase tracking-wide mt-1">In repair</div>
        </Link>
        <Link href="/admin/inventory?status=reserved" className="card p-3 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-indigo-700">{reserved}</div>
          <div className="text-[10px] text-gray-600 uppercase tracking-wide mt-1">Reserved</div>
        </Link>
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Recent orders</h3>
            <Link href="/admin/orders" className="text-xs text-brand-700">All →</Link>
          </div>
          <ul className="mt-3 divide-y divide-gray-100">
            {recentOrders.map((o) => {
              const st = o.status as OrderStatus;
              return (
                <li key={o.id} className="py-2 flex items-center justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs text-brand-700">{o.orderNumber}</Link>
                    <div className="text-xs text-gray-500 truncate">{o.customerName} · {date(o.createdAt)}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs rounded-full px-2 py-0.5 ${ORDER_STATUS_COLOR[st] || "bg-gray-100"}`}>{ORDER_STATUS_LABELS[st] || o.status}</span>
                    <span className="text-sm font-medium">{money(o.total)}</span>
                  </div>
                </li>
              );
            })}
            {recentOrders.length === 0 && <li className="py-4 text-sm text-gray-500">No orders yet.</li>}
          </ul>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Low-stock parts</h3>
            <Link href="/admin/parts" className="text-xs text-brand-700">All ({partsCount}) →</Link>
          </div>
          <ul className="mt-3 divide-y divide-gray-100">
            {lowStock.map((p) => (
              <li key={p.id} className="py-2 flex items-center justify-between text-sm">
                <Link href={`/admin/parts/${p.id}`} className="text-gray-900 hover:text-brand-700 truncate">{p.name}</Link>
                <span className={`text-xs rounded-full px-2 py-0.5 ${p.stock === 0 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{p.stock} left</span>
              </li>
            ))}
            {lowStock.length === 0 && <li className="py-4 text-sm text-gray-500">All parts well-stocked.</li>}
          </ul>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-gray-500">
        Analytics: privacy-friendly first-party tracking · no cookies sent to third parties · no fingerprinting.
        Sold lifetime: {sold}
      </p>
    </div>
  );
}
