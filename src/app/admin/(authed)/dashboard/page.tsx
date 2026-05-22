import Link from "next/link";
import { prisma } from "@/lib/db";
import { money, date } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [forSale, sold, inRepair, reserved, partsCount, lowStock, recent] = await Promise.all([
    prisma.phone.count({ where: { status: "for_sale" } }),
    prisma.phone.count({ where: { status: "sold" } }),
    prisma.phone.count({ where: { status: "in_repair" } }),
    prisma.phone.count({ where: { status: "reserved" } }),
    prisma.part.count(),
    prisma.part.findMany({ where: { stock: { lte: 3 } }, orderBy: { stock: "asc" }, take: 5 }),
    prisma.phone.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { supplier: true } })
  ]);

  const inventoryValue = await prisma.phone.aggregate({
    _sum: { askingPrice: true },
    where: { status: "for_sale" }
  });

  const stats = [
    { label: "For sale", value: forSale, color: "text-green-700" },
    { label: "In repair", value: inRepair, color: "text-amber-700" },
    { label: "Reserved", value: reserved, color: "text-blue-700" },
    { label: "Sold (lifetime)", value: sold, color: "text-gray-700" },
    { label: "Parts SKUs", value: partsCount, color: "text-purple-700" }
  ];

  return (
    <div>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">Snapshot of inventory and parts.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/inventory/new" className="btn-primary">+ Add phone</Link>
          <Link href="/admin/parts/new" className="btn-secondary">+ Add part</Link>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 card p-4">
        <h2 className="font-semibold text-gray-900">Inventory value (for sale)</h2>
        <div className="mt-2 text-3xl font-bold text-brand-700">
          {money(inventoryValue._sum.askingPrice ?? 0)}
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent intake</h2>
            <Link href="/admin/inventory" className="text-sm text-brand-700">All →</Link>
          </div>
          <ul className="mt-3 divide-y divide-gray-100">
            {recent.map((p) => (
              <li key={p.id} className="py-2 flex items-center justify-between">
                <div>
                  <Link href={`/admin/inventory/${p.id}`} className="font-medium text-gray-900 hover:text-brand-700">
                    {p.brand} {p.model}
                  </Link>
                  <div className="text-xs text-gray-500">
                    {date(p.purchaseDate)} · {p.supplier?.name || p.purchasedFrom || "—"}
                  </div>
                </div>
                <span className="text-sm font-medium text-brand-700">{money(p.purchasePrice)}</span>
              </li>
            ))}
            {recent.length === 0 && (
              <li className="py-4 text-sm text-gray-500">No phones yet — add your first one.</li>
            )}
          </ul>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Low-stock parts</h2>
            <Link href="/admin/parts" className="text-sm text-brand-700">All →</Link>
          </div>
          <ul className="mt-3 divide-y divide-gray-100">
            {lowStock.map((p) => (
              <li key={p.id} className="py-2 flex items-center justify-between">
                <Link href={`/admin/parts/${p.id}`} className="text-sm text-gray-900 hover:text-brand-700">
                  {p.name}
                </Link>
                <span className={`text-xs rounded-full px-2 py-0.5 ${p.stock === 0 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                  {p.stock} left
                </span>
              </li>
            ))}
            {lowStock.length === 0 && (
              <li className="py-4 text-sm text-gray-500">All parts well-stocked.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
