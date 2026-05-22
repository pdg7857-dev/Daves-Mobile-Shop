import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import PartForm from "@/components/PartForm";

export const dynamic = "force-dynamic";

export default async function EditPartPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partId = Number(id);
  if (!Number.isFinite(partId)) notFound();

  const part = await prisma.part.findUnique({ where: { id: partId } });
  if (!part) notFound();

  return (
    <div>
      <Link href="/admin/parts" className="text-sm text-brand-700">← Back to parts</Link>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">{part.name}</h1>
      <p className="text-sm text-gray-600 mb-6">SKU #{part.id}</p>
      <PartForm
        mode="edit"
        initial={{
          id: part.id,
          name: part.name,
          category: part.category,
          compatibleWith: part.compatibleWith,
          brand: part.brand,
          price: part.price,
          stock: part.stock,
          imageUrl: part.imageUrl,
          description: part.description
        }}
      />
    </div>
  );
}
