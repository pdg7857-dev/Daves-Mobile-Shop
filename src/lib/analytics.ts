import { prisma } from "@/lib/db";

export type Range = "day" | "week" | "month";

export function rangeWindow(range: Range): { start: Date; previousStart: Date } {
  const now = new Date();
  const start = new Date(now);
  const previousStart = new Date(now);
  switch (range) {
    case "day":
      start.setHours(now.getHours() - 24);
      previousStart.setHours(now.getHours() - 48);
      break;
    case "week":
      start.setDate(now.getDate() - 7);
      previousStart.setDate(now.getDate() - 14);
      break;
    case "month":
      start.setDate(now.getDate() - 30);
      previousStart.setDate(now.getDate() - 60);
      break;
  }
  return { start, previousStart };
}

function bucketLabel(d: Date, range: Range): string {
  if (range === "day") return `${d.getHours().toString().padStart(2, "0")}:00`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function bucketKey(d: Date, range: Range): string {
  if (range === "day") return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}-${d.getUTCHours()}`;
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
}

function bucketsFor(range: Range): Array<{ key: string; label: string; date: Date }> {
  const out: Array<{ key: string; label: string; date: Date }> = [];
  const now = new Date();
  const count = range === "day" ? 24 : range === "week" ? 7 : 30;
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    if (range === "day") d.setHours(now.getHours() - i);
    else d.setDate(now.getDate() - i);
    out.push({ key: bucketKey(d, range), label: bucketLabel(d, range), date: d });
  }
  return out;
}

export async function summarize(range: Range) {
  const { start, previousStart } = rangeWindow(range);

  const [
    pageviews,
    visitors,
    eventCounts,
    orders,
    prevPageviews,
    prevVisitors,
    prevOrders,
    topPages,
    landingPages,
    countries,
    regions,
    cities,
    deviceBreakdown
  ] = await Promise.all([
    prisma.pageView.count({ where: { createdAt: { gte: start } } }),
    prisma.pageView
      .findMany({
        where: { createdAt: { gte: start } },
        select: { visitorId: true },
        distinct: ["visitorId"]
      })
      .then((r) => r.length),
    prisma.analyticsEvent.groupBy({
      by: ["name"],
      where: { createdAt: { gte: start } },
      _count: { _all: true }
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: start }, status: { notIn: ["cancelled", "pending_payment"] } },
      _count: { _all: true },
      _sum: { total: true }
    }),
    // Previous-period comparisons
    prisma.pageView.count({ where: { createdAt: { gte: previousStart, lt: start } } }),
    prisma.pageView
      .findMany({
        where: { createdAt: { gte: previousStart, lt: start } },
        select: { visitorId: true },
        distinct: ["visitorId"]
      })
      .then((r) => r.length),
    prisma.order.aggregate({
      where: { createdAt: { gte: previousStart, lt: start }, status: { notIn: ["cancelled", "pending_payment"] } },
      _count: { _all: true },
      _sum: { total: true }
    }),
    // Top pages
    prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: start } },
      _count: { _all: true },
      orderBy: { _count: { path: "desc" } },
      take: 10
    }),
    // Top landing pages — first pageview of each session
    prisma.$queryRaw<Array<{ path: string; count: bigint }>>`
      SELECT path, COUNT(*)::bigint AS count
      FROM (
        SELECT DISTINCT ON ("sessionId") "sessionId", path
        FROM "PageView"
        WHERE "createdAt" >= ${start}
        ORDER BY "sessionId", "createdAt" ASC
      ) first_views
      GROUP BY path
      ORDER BY count DESC
      LIMIT 10
    `,
    prisma.pageView.groupBy({
      by: ["country"],
      where: { createdAt: { gte: start }, country: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { country: "desc" } },
      take: 8
    }),
    prisma.pageView.groupBy({
      by: ["region"],
      where: { createdAt: { gte: start }, region: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { region: "desc" } },
      take: 8
    }),
    prisma.pageView.groupBy({
      by: ["city"],
      where: { createdAt: { gte: start }, city: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { city: "desc" } },
      take: 10
    }),
    prisma.pageView.groupBy({
      by: ["device"],
      where: { createdAt: { gte: start }, device: { not: null } },
      _count: { _all: true }
    })
  ]);

  // Bucket pageviews + orders for chart
  const buckets = bucketsFor(range);
  const allPageviews = await prisma.pageView.findMany({
    where: { createdAt: { gte: start } },
    select: { createdAt: true }
  });
  const allOrders = await prisma.order.findMany({
    where: { createdAt: { gte: start }, status: { notIn: ["cancelled", "pending_payment"] } },
    select: { createdAt: true, total: true }
  });

  const pvByBucket = new Map<string, number>();
  for (const pv of allPageviews) {
    const k = bucketKey(pv.createdAt, range);
    pvByBucket.set(k, (pvByBucket.get(k) ?? 0) + 1);
  }
  const ordersByBucket = new Map<string, number>();
  const revByBucket = new Map<string, number>();
  for (const o of allOrders) {
    const k = bucketKey(o.createdAt, range);
    ordersByBucket.set(k, (ordersByBucket.get(k) ?? 0) + 1);
    revByBucket.set(k, (revByBucket.get(k) ?? 0) + o.total);
  }

  const chart = buckets.map((b) => ({
    label: b.label,
    pageviews: pvByBucket.get(b.key) ?? 0,
    orders: ordersByBucket.get(b.key) ?? 0,
    revenue: revByBucket.get(b.key) ?? 0
  }));

  // Event counts
  const eventMap = Object.fromEntries(eventCounts.map((e) => [e.name, e._count._all]));
  const addToCart = eventMap.add_to_cart ?? 0;
  const beginCheckout = eventMap.begin_checkout ?? 0;
  const purchase = eventMap.purchase ?? 0;
  const viewProduct = eventMap.view_product ?? 0;

  // Funnel — conversion rates between stages
  const funnel = [
    { stage: "Visitors", count: visitors, rate: 100 },
    { stage: "Add to cart", count: addToCart, rate: visitors ? (addToCart / visitors) * 100 : 0 },
    { stage: "Begin checkout", count: beginCheckout, rate: visitors ? (beginCheckout / visitors) * 100 : 0 },
    { stage: "Purchase", count: purchase, rate: visitors ? (purchase / visitors) * 100 : 0 }
  ];

  return {
    range,
    pageviews,
    visitors,
    pageviewsDelta: deltaPct(pageviews, prevPageviews),
    visitorsDelta: deltaPct(visitors, prevVisitors),
    revenue: orders._sum.total ?? 0,
    revenueDelta: deltaPct(orders._sum.total ?? 0, prevOrders._sum.total ?? 0),
    orderCount: orders._count._all,
    orderCountDelta: deltaPct(orders._count._all, prevOrders._count._all),
    addToCart,
    beginCheckout,
    purchase,
    viewProduct,
    funnel,
    chart,
    topPages: topPages.map((p) => ({ path: p.path, count: p._count._all })),
    landingPages: landingPages.map((p) => ({ path: p.path, count: Number(p.count) })),
    countries: countries.map((c) => ({ name: c.country!, count: c._count._all })),
    regions: regions.map((r) => ({ name: r.region!, count: r._count._all })),
    cities: cities.map((c) => ({ name: c.city!, count: c._count._all })),
    devices: deviceBreakdown.map((d) => ({ name: d.device!, count: d._count._all }))
  };
}

function deltaPct(now: number, prev: number): number {
  if (prev === 0) return now > 0 ? 100 : 0;
  return Math.round(((now - prev) / prev) * 100);
}
