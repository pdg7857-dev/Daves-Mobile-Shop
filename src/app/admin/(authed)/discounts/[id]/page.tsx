import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import DiscountForm from "@/components/DiscountForm";

export const dynamic = "force-dynamic";

export default async function EditDiscountPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const codeId = Number(id);
  if (!Number.isFinite(codeId)) notFound();
  const code = await prisma.discountCode.findUnique({ where: { id: codeId } });
  if (!code) notFound();

  return (
    <div>
      <Link href="/admin/discounts" className="text-sm text-brand-700">← Back to discounts</Link>
      <h1 className="mt-2 text-2xl font-bold text-gray-900 font-mono">{code.code}</h1>
      <p className="text-sm text-gray-600 mb-6">Used {code.usedCount} time{code.usedCount === 1 ? "" : "s"}{code.maxUses != null ? ` of ${code.maxUses} allowed` : ""}.</p>
      <DiscountForm
        mode="edit"
        initial={{
          id: code.id,
          code: code.code,
          description: code.description,
          discountType: code.discountType as "percentage" | "fixed",
          discountValue: code.discountValue,
          minOrderAmount: code.minOrderAmount,
          maxUses: code.maxUses,
          active: code.active,
          expiresAt: code.expiresAt ? code.expiresAt.toISOString().slice(0, 10) : null
        }}
      />
    </div>
  );
}
