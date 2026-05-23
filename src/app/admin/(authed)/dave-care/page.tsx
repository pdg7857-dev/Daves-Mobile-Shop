import Link from "next/link";
import { prisma } from "@/lib/db";
import { money, date } from "@/lib/format";
import { claimsRemaining } from "@/lib/dave-care";

export const dynamic = "force-dynamic";

export default async function AdminDaveCarePage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const sp = await searchParams;
  const where: Record<string, unknown> = {};
  if (sp.status) where.status = sp.status;
  if (sp.q) {
    where.OR = [
      { customerEmail: { contains: sp.q, mode: "insensitive" } },
      { customerName: { contains: sp.q, mode: "insensitive" } },
      { phoneLabel: { contains: sp.q, mode: "insensitive" } }
    ];
  }

  const [plans, counts] = await Promise.all([
    prisma.daveCarePlan.findMany({ where, orderBy: { createdAt: "desc" }, include: { order: { select: { orderNumber: true } } } }),
    prisma.daveCarePlan.groupBy({ by: ["status"], _count: { _all: true } })
  ]);

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count._all]));

  return (
    <div>
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Dave Care plans</h1>
        <p className="text-sm text-gray-600">Active protection plans and claim history.</p>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/admin/dave-care" className={`text-sm rounded-full px-3 py-1 border ${!sp.status ? "bg-brand-700 text-white border-brand-700" : "bg-white text-gray-700 border-gray-300"}`}>All ({plans.length})</Link>
        {(["active", "expired", "cancelled"] as const).map((s) => (
          <Link key={s} href={`/admin/dave-care?status=${s}`} className={`text-sm rounded-full px-3 py-1 border capitalize ${sp.status === s ? "bg-brand-700 text-white border-brand-700" : "bg-white text-gray-700 border-gray-300"}`}>{s} ({countMap[s] || 0})</Link>
        ))}
      </div>

      <form className="mt-4 flex flex-wrap gap-2" method="GET">
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        <input type="search" name="q" defaultValue={sp.q || ""} placeholder="Search customer, email, device…" className="input max-w-sm" />
        <button className="btn-secondary">Search</button>
      </form>

      <div className="mt-6 card overflow-hidden">
        <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
            <tr><th className="table-cell">Customer</th><th className="table-cell">Device</th><th className="table-cell">Plan</th><th className="table-cell">Started</th><th className="table-cell">Expires</th><th className="table-cell">Claims left</th><th className="table-cell">Status</th><th className="table-cell">Order</th><th className="table-cell"></th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {plans.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="table-cell"><div className="font-medium text-gray-900 whitespace-nowrap">{p.customerName}</div><div className="text-xs text-gray-500">{p.customerEmail}</div></td>
                <td className="table-cell text-xs whitespace-nowrap">{p.phoneLabel}</td>
                <td className="table-cell capitalize whitespace-nowrap">{p.planType} <span className="text-xs text-gray-500">({money(p.pricePaid)})</span></td>
                <td className="table-cell text-xs text-gray-600 whitespace-nowrap">{date(p.startedAt)}</td>
                <td className="table-cell text-xs text-gray-600 whitespace-nowrap">{p.expiresAt ? date(p.expiresAt) : "—"}</td>
                <td className="table-cell font-medium">{claimsRemaining(p)}/4</td>
                <td className="table-cell"><span className={`text-xs rounded-full px-2 py-0.5 capitalize ${p.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>{p.status}</span></td>
                <td className="table-cell font-mono text-xs"><Link href={`/admin/orders/${p.orderId}`} className="text-brand-700 hover:text-brand-900">{p.order.orderNumber}</Link></td>
                <td className="table-cell text-right"><Link href={`/admin/dave-care/${p.id}`} className="text-brand-700 hover:text-brand-900 text-sm">Manage</Link></td>
              </tr>
            ))}
            {plans.length === 0 && (<tr><td className="table-cell text-center text-gray-500 py-10" colSpan={9}>No Dave Care plans yet.</td></tr>)}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
