import { prisma } from "@/lib/db";
import SuppliersClient from "./SuppliersClient";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { phones: true } } }
  });

  return (
    <div>
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
        <p className="text-sm text-gray-600">Track where your inventory comes from.</p>
      </header>
      <SuppliersClient
        initial={suppliers.map((s) => ({
          id: s.id,
          name: s.name,
          contact: s.contact,
          notes: s.notes,
          phoneCount: s._count.phones
        }))}
      />
    </div>
  );
}
