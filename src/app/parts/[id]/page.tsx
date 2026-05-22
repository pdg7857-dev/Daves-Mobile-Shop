import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { money } from "@/lib/format";

export default async function PartDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partId = Number(id);
  if (!Number.isFinite(partId)) notFound();

  const part = await prisma.part.findUnique({ where: { id: partId } });
  if (!part) notFound();

  const inStock = part.stock > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/parts" className="text-sm text-brand-700 hover:text-brand-900">
        ← Back to parts
      </Link>

      <div className="mt-6 grid lg:grid-cols-2 gap-10">
        <div className="aspect-square rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[10rem]">
          {part.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={part.imageUrl} alt={part.name} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <span>🔧</span>
          )}
        </div>
        <div>
          <span className="text-sm uppercase tracking-wide text-brand-600 font-semibold">
            {part.category.replace("-", " ")}
          </span>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">{part.name}</h1>
          <p className="mt-2 text-sm text-gray-600">Compatible with: {part.compatibleWith}</p>
          {part.brand && <p className="text-sm text-gray-600">Brand: {part.brand}</p>}

          <div className="mt-6 text-4xl font-bold text-brand-700">{money(part.price)}</div>
          <div className="mt-2">
            {inStock ? (
              <span className="text-sm rounded-full bg-green-100 text-green-800 px-3 py-1">
                {part.stock} in stock
              </span>
            ) : (
              <span className="text-sm rounded-full bg-red-100 text-red-800 px-3 py-1">
                Out of stock — contact us for ETA
              </span>
            )}
          </div>

          <Link href="/contact" className="mt-6 btn-primary inline-flex">
            {inStock ? "Order this part" : "Get notified when in stock"}
          </Link>

          {part.description && (
            <div className="mt-6 card p-4 bg-gray-50">
              <p className="text-sm text-gray-700">{part.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
