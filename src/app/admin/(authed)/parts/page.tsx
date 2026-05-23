import Link from "next/link";
import { prisma } from "@/lib/db";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminPartsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const where: Record<string, unknown> = {};
  if (sp.category) where.category = sp.category;
  if (sp.q) {
    where.OR = [
      { name: { contains: sp.q, mode: "insensitive" } },
      { compatibleWith: { contains: sp.q, mode: "insensitive" } }
    ];
  }
  // Categories list comes from full catalogue so the dropdown stays stable when a filter is active.
  const [parts, allCategories] = await Promise.all([
    prisma.part.findMany({ where, orderBy: [{ category: "asc" }, { name: "asc" }] }),
    prisma.part.findMany({ select: { category: true }, distinct: ["category"], orderBy: { category: "asc" } })
  ]);
  const categories = allCategories.map((c) => c.category);

  return (
    <div>
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parts</h1>
          <p className="text-sm text-gray-600">Stock and pricing for resale parts.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/parts/import" className="btn-secondary">Bulk import</Link>
          <Link href="/admin/parts/new" className="btn-primary">+ Add part</Link>
        </div>
      </header>

      <form className="mt-6 flex flex-wrap gap-2 items-center" method="GET">
        <input type="search" name="q" placeholder="Search…" defaultValue={sp.q || ""} className="input max-w-xs" />
        <select name="category" defaultValue={sp.category || ""} className="input max-w-[200px]">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="btn-secondary">Filter</button>
      </form>

      <div className="mt-6 card overflow-hidden">
        <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="table-cell">Part</th>
              <th className="table-cell">Category</th>
              <th className="table-cell">Compatible with</th>
              <th className="table-cell text-right">Price</th>
              <th className="table-cell text-right">Stock</th>
              <th className="table-cell"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {parts.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="table-cell font-medium text-gray-900">{p.name}</td>
                <td className="table-cell capitalize whitespace-nowrap">{p.category.replace("-", " ")}</td>
                <td className="table-cell text-gray-600">{p.compatibleWith}</td>
                <td className="table-cell text-right whitespace-nowrap">{money(p.price)}</td>
                <td className="table-cell text-right"><span className={`text-xs rounded-full px-2 py-0.5 ${p.stock === 0 ? "bg-red-100 text-red-800" : p.stock <= 3 ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>{p.stock}</span></td>
                <td className="table-cell text-right"><Link href={`/admin/parts/${p.id}`} className="text-brand-700 hover:text-brand-900 text-sm">Edit</Link></td>
              </tr>
            ))}
            {parts.length === 0 && (<tr><td className="table-cell text-center text-gray-500 py-10" colSpan={6}>No parts.</td></tr>)}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
