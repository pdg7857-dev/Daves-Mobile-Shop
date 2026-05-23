import Link from "next/link";
import { prisma } from "@/lib/db";
import { money, date } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLOR, type OrderStatus } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    forSale, sold, inRepair, reserved, partsCount,
    pendingOrders, paidOrders, activePlans, lowStock, recentIntake, recentOrders
  ] = await Promise.all([
    prisma.phone.count({ where: { status: "for_sale" } }),
    prisma.phone.count({ where: { status: "sold" } }),
    prisma.phone.count({ where: { status: "in_repair" } }),
    prisma.phone.count({ where: { status: "reserved" } }),
    prisma.part.count(),
    prisma.order.count({ where: { status: "pending_payment" } }),
    prisma.order.count({ where: { status: { in: ["paid", "processing"] } } }),
    prisma.daveCarePlan.count({ where: { status: "active" } }),
    prisma.part.findMany({ where: { stock: { lte: 3 } }, orderBy: { stock: "asc" }, take: 5 }),
    prisma.phone.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { supplier: true } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 })
  ]);

  const inventoryValue = await prisma.phone.aggregate({ _sum: { askingPrice: true }, where: { status: "for_sale" } });
  const ordersRevenue = await prisma.order.aggregate({ _sum: { total: true }, where: { status: { in: ["paid", "processing", "shipped", "delivered"] } } });

  const stats = [
    { label: "Pending payment", value: pendingOrders, color: "text-amber-700", href: "/admin/orders?status=pending_payment" },
    { label: "Awaiting shipment", value: paidOrders, color: "text-blue-700", href: "/admin/orders?status=paid" },
    { label: "Phones for sale", value: forSale, color: "text-green-700", href: "/admin/inventory?status=for_sale" },
    { label: "Active Dave Care", value: activePlans, color: "text-emerald-700", href: "/admin/dave-care?status=active" },
    { label: "Reserved", value: reserved, color: "text-indigo-700", href: "/admin/inventory?status=reserved" },
    { label: "In repair", value: inRepair, color: "text-purple-700", href: "/admin/inventory?status=in_repair" },
    { label: "Sold lifetime", value: sold, color: "text-gray-700", href: "/admin/inventory?status=sold" }
  ];

  return (
    <div>
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">Snapshot of orders, inventory and parts.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/inventory/new" className="btn-primary">+ Add phone</Link>
          <Link href="/admin/parts/new" className="btn-secondary">+ Add part</Link>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-4 hover:shadow-md transition-shadow">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <div className="card p-4"><h2 className="font-semibold text-gray-900">Inventory value (for sale)</h2><div className="mt-2 text-3xl font-bold text-brand-700">{money(inventoryValue._sum.askingPrice ?? 0)}</div></div>
        <div className="card p-4"><h2 className="font-semibold text-gray-900">Order revenue (paid+)</h2><div className="mt-2 text-3xl font-bold text-green-700">{money(ordersRevenue._sum.total ?? 0)}</div></div>
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <div className="flex items-center justify-between"><h2 className="font-semibold text-gray-900">Recent orders</h2><Link href="/admin/orders" className="text-sm text-brand-700">All →</Link></div>
          <ul className="mt-3 divide-y divide-gray-100">
            {recentOrders.map((o) => {
              const st = o.status as OrderStatus;
              return (
                <li key={o.id} className="py-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs text-brand-700 hover:text-brand-900">{o.orderNumber}</Link>
                    <div className="text-xs text-gray-500 truncate">{o.customerName} · {o.city}, {o.province} · {date(o.createdAt)}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs rounded-full px-2 py-0.5 ${ORDER_STATUS_COLOR[st] || "bg-gray-100"}`}>{ORDER_STATUS_LABELS[st] || o.status}</span>
                    <span className="text-sm font-medium">{money(o.total)}</span>
                  </div>
                </li>
              );
            })}
            {recentOrders.length === 0 && (<li className="py-4 text-sm text-gray-500">No orders yet.</li>)}
          </ul>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between"><h2 className="font-semibold text-gray-900">Recent intake</h2><Link href="/admin/inventory" className="text-sm text-brand-700">All →</Link></div>
          <ul className="mt-3 divide-y divide-gray-100">
            {recentIntake.map((p) => (
              <li key={p.id} className="py-2 flex items-center justify-between">
                <div>
                  <Link href={`/admin/inventory/${p.id}`} className="font-medium text-gray-900 hover:text-brand-700">{p.brand} {p.model}</Link>
                  <div className="text-xs text-gray-500">{date(p.purchaseDate)} · {p.supplier?.name || p.purchasedFrom || "—"}</div>
                </div>
                <span className="text-sm font-medium text-brand-700">{money(p.purchasePrice)}</span>
              </li>
            ))}
            {recentIntake.length === 0 && (<li className="py-4 text-sm text-gray-500">No phones yet — add your first one.</li>)}
          </ul>
        </div>
      </div>

      <div className="mt-6 card p-4">
        <div className="flex items-center justify-between"><h2 className="font-semibold text-gray-900">Low-stock parts ({partsCount} total SKUs)</h2><Link href="/admin/parts" className="text-sm text-brand-700">All →</Link></div>
        <ul className="mt-3 divide-y divide-gray-100">
          {lowStock.map((p) => (
            <li key={p.id} className="py-2 flex items-center justify-between">
              <Link href={`/admin/parts/${p.id}`} className="text-sm text-gray-900 hover:text-brand-700">{p.name}</Link>
              <span className={`text-xs rounded-full px-2 py-0.5 ${p.stock === 0 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{p.stock} left</span>
            </li>
          ))}
          {lowStock.length === 0 && (<li className="py-4 text-sm text-gray-500">All parts well-stocked.</li>)}
        </ul>
      </div>
    </div>
  );
}
