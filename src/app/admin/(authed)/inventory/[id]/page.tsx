import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import PhoneForm from "@/components/PhoneForm";
import RepairList from "@/components/RepairList";

export const dynamic = "force-dynamic";

export default async function EditPhonePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const phoneId = Number(id);
  if (!Number.isFinite(phoneId)) notFound();

  const [phone, suppliers] = await Promise.all([
    prisma.phone.findUnique({
      where: { id: phoneId },
      include: { repairs: { orderBy: { performedAt: "desc" } } }
    }),
    prisma.supplier.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })
  ]);
  if (!phone) notFound();

  return (
    <div>
      <Link href="/admin/inventory" className="text-sm text-brand-700">← Back to inventory</Link>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">
        {phone.brand} {phone.model}
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        ID #{phone.id} · created {phone.createdAt.toLocaleDateString("en-CA")}
      </p>

      <PhoneForm
        mode="edit"
        suppliers={suppliers}
        initial={{
          id: phone.id,
          brand: phone.brand,
          model: phone.model,
          storage: phone.storage,
          color: phone.color,
          condition: phone.condition,
          imei: phone.imei,
          serial: phone.serial,
          purchasePrice: phone.purchasePrice,
          askingPrice: phone.askingPrice,
          status: phone.status,
          purchaseDate: phone.purchaseDate.toISOString().slice(0, 10),
          purchasedFrom: phone.purchasedFrom,
          supplierId: phone.supplierId,
          notes: phone.notes,
          city: phone.city,
          imageUrl: phone.imageUrl
        }}
      />

      <div className="mt-10">
        <RepairList
          phoneId={phone.id}
          initial={phone.repairs.map((r) => ({ ...r, performedAt: r.performedAt.toISOString() }))}
        />
      </div>
    </div>
  );
}
