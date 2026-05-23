import { prisma } from "@/lib/db";
import PhoneCard from "@/components/PhoneCard";
import { CITIES } from "@/lib/cities";
import Link from "next/link";

export const metadata = {
  title: "Phones in Stock — Dave's Mobile Shop",
  description: "Refurbished iPhones, Samsungs and Pixels, fully tested and ready to go."
};

export const dynamic = "force-dynamic";

type SearchParams = { city?: string; brand?: string };

export default async function InventoryPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const where: { status: string; city?: string; brand?: string } = { status: "for_sale" };
  if (sp.city) where.city = sp.city;
  if (sp.brand) where.brand = sp.brand;

  const phones = await prisma.phone.findMany({
    where,
    orderBy: [{ createdAt: "desc" }]
  });

  const brands = [...new Set(phones.map((p) => p.brand))].sort();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold text-white">Phones in stock</h1>
        <p className="mt-3 text-gray-400">
          Every phone is tested, cleaned and comes with a 30-day warranty.
          Inventory rotates fast — call ahead to hold one for pickup.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/inventory"
          className={`text-sm rounded-full px-3 py-1 border ${
            !sp.city && !sp.brand ? "bg-brand-700 text-white border-brand-700" : "bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800"
          }`}
        >
          All
        </Link>
        {CITIES.map((c) => (
          <Link
            key={c.slug}
            href={`/inventory?city=${c.slug}`}
            className={`text-sm rounded-full px-3 py-1 border ${
              sp.city === c.slug ? "bg-brand-700 text-white border-brand-700" : "bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {brands.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {brands.map((b) => (
            <Link
              key={b}
              href={`/inventory?brand=${encodeURIComponent(b)}${sp.city ? `&city=${sp.city}` : ""}`}
              className={`text-xs rounded-full px-3 py-1 border ${
                sp.brand === b ? "bg-gray-900 text-white border-gray-900" : "bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800"
              }`}
            >
              {b}
            </Link>
          ))}
        </div>
      )}

      {phones.length === 0 ? (
        <div className="mt-12 card p-10 text-center">
          <p className="text-gray-400">No phones match your filter right now.</p>
          <Link href="/contact" className="mt-4 btn-primary inline-flex">
            Tell us what you&apos;re looking for
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {phones.map((p) => (
            <PhoneCard key={p.id} phone={p} />
          ))}
        </div>
      )}
    </div>
  );
}
