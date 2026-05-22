import Link from "next/link";
import { prisma } from "@/lib/db";
import PhoneForm from "@/components/PhoneForm";

export const dynamic = "force-dynamic";

export default async function NewPhonePage() {
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <Link href="/admin/inventory" className="text-sm text-brand-700">← Back to inventory</Link>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">Add phone</h1>
      <p className="text-sm text-gray-600 mb-6">Log a new device coming into inventory.</p>
      <PhoneForm
        mode="create"
        suppliers={suppliers}
        initial={{
          brand: "",
          model: "",
          condition: "",
          purchasePrice: "",
          status: "for_sale",
          purchaseDate: today
        }}
      />
    </div>
  );
}
