import Link from "next/link";
import { prisma } from "@/lib/db";
import { money, date } from "@/lib/format";

export const dynamic = "force-dynamic";

function daysFromNow(d: Date | null): number | null {
  if (!d) return null;
  return Math.round((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default async function RetentionPage() {
  const now = new Date();
  const in30 = new Date(now);
  in30.setDate(in30.getDate() + 30);
  const in60 = new Date(now);
  in60.setDate(in60.getDate() + 60);
  const in90 = new Date(now);
  in90.setDate(in90.getDate() + 90);

  const [
    active,
    expired,
    cancelled,
    expiringSoon,
    expiring30to60,
    expiring60to90,
    plansWithClaims,
    claimBreakdown,
    monthlyPlans
  ] = await Promise.all([
    prisma.daveCarePlan.count({ where: { status: "active" } }),
    prisma.daveCarePlan.count({ where: { status: "expired" } }),
    prisma.daveCarePlan.count({ where: { status: "cancelled" } }),
    // Expiring in next 30 days (active annual plans)
    prisma.daveCarePlan.findMany({
      where: { status: "active", expiresAt: { lte: in30, gte: now } },
      orderBy: { expiresAt: "asc" },
      include: { claims: true }
    }),
    prisma.daveCarePlan.findMany({
      where: { status: "active", expiresAt: { gt: in30, lte: in60 } },
      orderBy: { expiresAt: "asc" }
    }),
    prisma.daveCarePlan.findMany({
      where: { status: "active", expiresAt: { gt: in60, lte: in90 } },
      orderBy: { expiresAt: "asc" }
    }),
    // Plans where any claim was used — good upsell signal
    prisma.daveCarePlan.findMany({
      where: {
        status: "active",
        OR: [{ batteryUsed: true }, { cameraUsed: true }, { screenUsed: true }, { backGlassUsed: true }]
      },
      include: { claims: true },
      orderBy: { startedAt: "desc" },
      take: 20
    }),
    // Claim type breakdown
    prisma.daveCareClaim.groupBy({
      by: ["claimType"],
      _count: { _all: true },
      _sum: { upgradePaid: true, partCost: true, laborCost: true }
    }),
    // Monthly plans — these are where the real recurring-billing pain will be
    prisma.daveCarePlan.findMany({
      where: { status: "active", planType: "monthly" },
      orderBy: { startedAt: "asc" }
    })
  ]);

  const totalUpgradeRevenue = claimBreakdown.reduce((s, c) => s + (c._sum.upgradePaid ?? 0), 0);
  const totalClaimCost = claimBreakdown.reduce((s, c) => s + (c._sum.partCost ?? 0) + (c._sum.laborCost ?? 0), 0);

  return (
    <div>
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dave Care Retention</h1>
          <p className="text-sm text-gray-600">Renewals, claim usage, and customer outreach prompts.</p>
        </div>
        <Link href="/admin/dave-care" className="btn-secondary">All plans</Link>
      </header>

      {/* Stripe billing warning */}
      <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-amber-900">⚠ Recurring billing not yet active</p>
            <p className="mt-1 text-xs text-amber-800 max-w-xl">
              Monthly Dave Care plans below need <strong>Stripe Subscriptions</strong> wired up to auto-charge customers
              and detect missed payments / expired cards. Until that's set up, you'll need to manually invoice these {monthlyPlans.length} customer{monthlyPlans.length === 1 ? "" : "s"} each month. Annual plans are paid up-front so they're fine.
            </p>
          </div>
          <span className="text-xs rounded-full bg-amber-200 text-amber-900 px-2 py-0.5">Stripe TODO</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">Active plans</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{active}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">Monthly (needs billing)</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">{monthlyPlans.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">Expired</p>
          <p className="mt-2 text-2xl font-bold text-gray-700">{expired}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">Cancelled</p>
          <p className="mt-2 text-2xl font-bold text-red-700">{cancelled}</p>
        </div>
      </div>

      {/* Claim breakdown */}
      <div className="mt-6 card p-5">
        <h2 className="font-semibold text-gray-900">Claims to date</h2>
        <div className="mt-3 grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {["screen", "battery", "camera", "backGlass"].map((t) => {
            const row = claimBreakdown.find((c) => c.claimType === t);
            return (
              <div key={t} className="rounded-md border border-gray-200 p-3">
                <p className="text-xs text-gray-500 capitalize">{t === "backGlass" ? "back glass" : t}</p>
                <p className="mt-1 text-xl font-bold text-gray-900">{row?._count._all ?? 0}</p>
                {row?._sum.upgradePaid ? (
                  <p className="text-xs text-emerald-700 mt-1">+{money(row._sum.upgradePaid)} upgrades</p>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-xs text-gray-600 flex flex-wrap gap-4">
          <span>Total upgrade revenue: <strong className="text-emerald-700">{money(totalUpgradeRevenue)}</strong></span>
          <span>Total internal cost: <strong className="text-red-700">{money(totalClaimCost)}</strong></span>
          <span>Net: <strong>{money(totalUpgradeRevenue - totalClaimCost)}</strong></span>
        </div>
      </div>

      {/* Renewal calendar */}
      <h2 className="mt-8 text-lg font-bold text-gray-900">Renewal calendar — reach out now</h2>
      <div className="mt-3 grid lg:grid-cols-3 gap-3">
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-red-700">Expiring within 30 days ({expiringSoon.length})</h3>
          {expiringSoon.length === 0 ? (
            <p className="mt-3 text-xs text-gray-500">No urgent renewals.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {expiringSoon.map((p) => {
                const days = daysFromNow(p.expiresAt);
                const claimCount = p.claims.length;
                return (
                  <li key={p.id} className="border-b border-gray-100 pb-2 last:border-0">
                    <Link href={`/admin/dave-care/${p.id}`} className="font-medium text-gray-900 hover:text-brand-700">
                      {p.customerName}
                    </Link>
                    <p className="text-xs text-gray-500">{p.phoneLabel}</p>
                    <p className="text-xs">
                      <span className="text-red-700 font-medium">{days != null && days >= 0 ? `${days}d left` : "Expired"}</span>
                      <span className="text-gray-500"> · </span>
                      <span className="text-gray-700">{claimCount} claim{claimCount === 1 ? "" : "s"} used</span>
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-semibold text-amber-700">30–60 days ({expiring30to60.length})</h3>
          {expiring30to60.length === 0 ? (
            <p className="mt-3 text-xs text-gray-500">Nothing in this window.</p>
          ) : (
            <ul className="mt-3 space-y-1 text-sm">
              {expiring30to60.map((p) => (
                <li key={p.id} className="text-xs flex justify-between">
                  <Link href={`/admin/dave-care/${p.id}`} className="text-gray-800 hover:text-brand-700 truncate">{p.customerName}</Link>
                  <span className="text-gray-500 shrink-0 ml-2">{p.expiresAt ? date(p.expiresAt) : ""}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-700">60–90 days ({expiring60to90.length})</h3>
          {expiring60to90.length === 0 ? (
            <p className="mt-3 text-xs text-gray-500">Nothing in this window.</p>
          ) : (
            <ul className="mt-3 space-y-1 text-sm">
              {expiring60to90.map((p) => (
                <li key={p.id} className="text-xs flex justify-between">
                  <Link href={`/admin/dave-care/${p.id}`} className="text-gray-800 hover:text-brand-700 truncate">{p.customerName}</Link>
                  <span className="text-gray-500 shrink-0 ml-2">{p.expiresAt ? date(p.expiresAt) : ""}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Plans with claim usage — good upsell signal */}
      <h2 className="mt-8 text-lg font-bold text-gray-900">Plans with claims used — high-value renewals</h2>
      <p className="text-xs text-gray-600 mt-1">These customers have actually USED their coverage. They&rsquo;re much more likely to renew.</p>

      <div className="mt-3 card overflow-hidden">
        {plansWithClaims.length === 0 ? (
          <p className="p-10 text-center text-gray-500 text-sm">No claims used yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-600 uppercase tracking-wide">
              <tr>
                <th className="table-cell">Customer</th>
                <th className="table-cell">Device</th>
                <th className="table-cell">Plan</th>
                <th className="table-cell">Claims used</th>
                <th className="table-cell">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {plansWithClaims.map((p) => {
                const usedTypes = [
                  p.screenUsed && "Screen",
                  p.batteryUsed && "Battery",
                  p.cameraUsed && "Camera",
                  p.backGlassUsed && "Back glass"
                ].filter(Boolean).join(", ");
                return (
                  <tr key={p.id}>
                    <td className="table-cell">
                      <Link href={`/admin/dave-care/${p.id}`} className="font-medium text-gray-900 hover:text-brand-700">{p.customerName}</Link>
                      <div className="text-xs text-gray-500">{p.customerEmail}</div>
                    </td>
                    <td className="table-cell text-xs">{p.phoneLabel}</td>
                    <td className="table-cell text-xs capitalize">{p.planType}</td>
                    <td className="table-cell text-xs">{usedTypes}</td>
                    <td className="table-cell text-xs">{p.expiresAt ? date(p.expiresAt) : <span className="text-gray-400">—</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
