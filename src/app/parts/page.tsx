import Link from "next/link";
import { prisma } from "@/lib/db";
import PartCard from "@/components/PartCard";

export const metadata = {
  title: "Phone Parts — Dave's Mobile Shop",
  description: "Screens, batteries, charging ports, cameras and more for iPhone, Samsung, Pixel and more."
};

export const dynamic = "force-dynamic";

type SearchParams = { category?: string };

export default async function PartsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const where = sp.category ? { category: sp.category } : {};
  const parts = await prisma.part.findMany({ where, orderBy: [{ category: "asc" }, { name: "asc" }] });
  const categories = await prisma.part.findMany({ select: { category: true }, distinct: ["category"], orderBy: { category: "asc" } });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900">Phone parts</h1>
        <p className="mt-3 text-gray-600">OEM and aftermarket parts for technicians and DIY repairs. Wholesale pricing on bulk orders — contact us.</p>
      </header>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/parts" className={`text-sm rounded-full px-3 py-1 border ${!sp.category ? "bg-brand-700 text-white border-brand-700" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}>All categories</Link>
        {categories.map((c) => (
          <Link key={c.category} href={`/parts?category=${encodeURIComponent(c.category)}`} className={`text-sm rounded-full px-3 py-1 border capitalize ${sp.category === c.category ? "bg-brand-700 text-white border-brand-700" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}>{c.category.replace("-", " ")}</Link>
        ))}
      </div>

      {parts.length === 0 ? (
        <p className="mt-12 text-center text-gray-600">No parts in this category right now.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {parts.map((p) => (<PartCard key={p.id} part={p} />))}
        </div>
      )}
    </div>
  );
}
