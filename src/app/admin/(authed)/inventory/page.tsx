import Link from "next/link";
import { prisma } from "@/lib/db";
import { money, date, STATUS_LABELS, STATUS_COLOR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const where: Record<string, unknown> = {};
  if (sp.status) where.status = sp.status;
  if (sp.q) {
    where.OR = [
      { brand: { contains: sp.q, mode: "insensitive" } },
      { model: { contains: sp.q, mode: "insensitive" } },
      { imei: { contains: sp.q, mode: "insensitive" } },
      { serial: { contains: sp.q, mode: "insensitive" } }
    ];
  }

  const phones = await prisma.phone.findMany({ where, orderBy: { createdAt: "desc" }, include: { supplier: true } });

  return (
    <div>
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-600">All phones, regardless of status.</p>
        </div>
        <Link href="/admin/inventory/new" className="btn-primary">+ Add phone</Link>
      </header>

      <form className="mt-6 flex flex-wrap gap-2 items-center" method="GET">
        <input type="search" name="q" placeholder="Search brand, model, IMEI, serial…" defaultValue={sp.q || ""} className="input max-w-xs" />
        <select name="status" defaultValue={sp.status || ""} className="input max-w-[180px]">
          <option value="">All statuses</option>
          <option value="for_sale">For sale</option>
          <option value="in_repair">In repair</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
        </select>
        <button type="submit" className="btn-secondary">Filter</button>
      </form>

      <div className="mt-6 card overflow-hidden">
        <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="table-cell">Device</th>
              <th className="table-cell">Status</th>
              <th className="table-cell">IMEI / Serial</th>
              <th className="table-cell">Purchased</th>
              <th className="table-cell">From</th>
              <th className="table-cell text-right">Cost</th>
              <th className="table-cell text-right">Asking</th>
              <th className="table-cell"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {phones.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="table-cell">
                  <div className="font-medium text-gray-900 whitespace-nowrap">{p.brand} {p.model}</div>
                  <div className="text-xs text-gray-500">{[p.storage, p.color, p.condition].filter(Boolean).join(" · ")}</div>
                </td>
                <td className="table-cell"><span className={`text-xs rounded-full px-2 py-0.5 whitespace-nowrap ${STATUS_COLOR[p.status] || "bg-gray-100"}`}>{STATUS_LABELS[p.status] || p.status}</span></td>
                <td className="table-cell font-mono text-xs">
                  {p.imei && <div>IMEI: {p.imei}</div>}
                  {p.serial && <div>SN: {p.serial}</div>}
                </td>
                <td className="table-cell text-gray-600 whitespace-nowrap">{date(p.purchaseDate)}</td>
                <td className="table-cell text-gray-600">{p.supplier?.name || p.purchasedFrom || "—"}</td>
                <td className="table-cell text-right whitespace-nowrap">{money(p.purchasePrice)}</td>
                <td className="table-cell text-right font-medium text-brand-700 whitespace-nowrap">{money(p.askingPrice)}</td>
                <td className="table-cell text-right"><Link href={`/admin/inventory/${p.id}`} className="text-brand-700 hover:text-brand-900 text-sm">Edit</Link></td>
              </tr>
            ))}
            {phones.length === 0 && (
              <tr><td className="table-cell text-center text-gray-500 py-10" colSpan={8}>No phones found. <Link href="/admin/inventory/new" className="text-brand-700">Add one →</Link></td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
