import Link from "next/link";
import { prisma } from "@/lib/db";
import { date } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  const codes = await prisma.discountCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions & discount codes</h1>
          <p className="text-sm text-gray-600">Create promo codes customers can apply at checkout.</p>
        </div>
        <Link href="/admin/discounts/new" className="btn-primary">+ New discount code</Link>
      </header>

      <div className="mt-6 card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="table-cell">Code</th>
              <th className="table-cell">Discount</th>
              <th className="table-cell">Min order</th>
              <th className="table-cell">Uses</th>
              <th className="table-cell">Status</th>
              <th className="table-cell">Expires</th>
              <th className="table-cell"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {codes.map((c) => {
              const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
              const exhausted = c.maxUses != null && c.usedCount >= c.maxUses;
              const inactive = !c.active || expired || exhausted;
              return (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="font-mono font-semibold text-gray-900">{c.code}</div>
                    {c.description && <div className="text-xs text-gray-500">{c.description}</div>}
                  </td>
                  <td className="table-cell">
                    {c.discountType === "percentage" ? `${c.discountValue}% off` : `$${c.discountValue.toFixed(2)} off`}
                  </td>
                  <td className="table-cell text-gray-600">{c.minOrderAmount ? `$${c.minOrderAmount.toFixed(2)}` : "—"}</td>
                  <td className="table-cell text-gray-600">{c.usedCount}{c.maxUses != null ? ` / ${c.maxUses}` : ""}</td>
                  <td className="table-cell">
                    <span className={`text-xs rounded-full px-2 py-0.5 ${inactive ? "bg-gray-200 text-gray-600" : "bg-green-100 text-green-800"}`}>
                      {expired ? "Expired" : exhausted ? "Maxed out" : c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="table-cell text-gray-600">{c.expiresAt ? date(c.expiresAt) : "—"}</td>
                  <td className="table-cell text-right">
                    <Link href={`/admin/discounts/${c.id}`} className="text-brand-700 hover:text-brand-900 text-sm">Edit</Link>
                  </td>
                </tr>
              );
            })}
            {codes.length === 0 && (
              <tr><td className="table-cell text-center text-gray-500 py-10" colSpan={7}>No discount codes yet. <Link href="/admin/discounts/new" className="text-brand-700">Create one →</Link></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
