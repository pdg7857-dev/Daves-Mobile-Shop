import Link from "next/link";
import { prisma } from "@/lib/db";
import { money, date } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLOR, type OrderStatus } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const where: Record<string, unknown> = {};
  if (sp.status) where.status = sp.status;
  if (sp.q) {
    where.OR = [
      { orderNumber: { contains: sp.q.toUpperCase() } },
      { customerEmail: { contains: sp.q.toLowerCase() } },
      { customerName: { contains: sp.q } }
    ];
  }

  const [orders, counts] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { items: true }
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } })
  ]);

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count._all]));

  return (
    <div>
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-600">All customer orders across the store.</p>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`text-sm rounded-full px-3 py-1 border ${!sp.status ? "bg-brand-700 text-white border-brand-700" : "bg-white text-gray-700 border-gray-300"}`}
        >
          All ({orders.length})
        </Link>
        {(["pending_payment", "paid", "processing", "shipped", "delivered", "cancelled"] as OrderStatus[]).map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`text-sm rounded-full px-3 py-1 border ${sp.status === s ? "bg-brand-700 text-white border-brand-700" : "bg-white text-gray-700 border-gray-300"}`}
          >
            {ORDER_STATUS_LABELS[s]} ({countMap[s] || 0})
          </Link>
        ))}
      </div>

      <form className="mt-4 flex flex-wrap gap-2" method="GET">
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        <input type="search" name="q" defaultValue={sp.q || ""} placeholder="Search order #, email, name…" className="input max-w-sm" />
        <button className="btn-secondary">Search</button>
      </form>

      <div className="mt-6 card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="table-cell">Order #</th>
              <th className="table-cell">Date</th>
              <th className="table-cell">Customer</th>
              <th className="table-cell">Ship to</th>
              <th className="table-cell">Items</th>
              <th className="table-cell">Status</th>
              <th className="table-cell text-right">Total</th>
              <th className="table-cell"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => {
              const st = o.status as OrderStatus;
              return (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="table-cell font-mono text-xs">{o.orderNumber}</td>
                  <td className="table-cell text-gray-600">{date(o.createdAt)}</td>
                  <td className="table-cell">
                    <div className="font-medium text-gray-900">{o.customerName}</div>
                    <div className="text-xs text-gray-500">{o.customerEmail}</div>
                  </td>
                  <td className="table-cell text-xs text-gray-600">{o.city}, {o.province}</td>
                  <td className="table-cell text-xs text-gray-600">{o.items.length}</td>
                  <td className="table-cell">
                    <span className={`text-xs rounded-full px-2 py-0.5 ${ORDER_STATUS_COLOR[st] || "bg-gray-100"}`}>
                      {ORDER_STATUS_LABELS[st] || o.status}
                    </span>
                  </td>
                  <td className="table-cell text-right font-medium">{money(o.total)}</td>
                  <td className="table-cell text-right">
                    <Link href={`/admin/orders/${o.id}`} className="text-brand-700 hover:text-brand-900 text-sm">View</Link>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr><td className="table-cell text-center text-gray-500 py-10" colSpan={8}>No orders match this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
