import { prisma } from "@/lib/db";
import PhoneCard from "@/components/PhoneCard";
import { CITIES } from "@/lib/cities";
import Link from "next/link";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Phones in Stock — Dave's Mobile Shop",
  description: "Refurbished iPhones, Samsungs and Pixels, fully tested and ready to go."
};

export const dynamic = "force-dynamic";

type SearchParams = { city?: string; brand?: string };

function chipClass(active: boolean) {
  return [
    "text-[13px] rounded-full px-3.5 py-1.5 font-medium transition-colors",
    active
      ? "bg-white text-black"
      : "bg-white/[0.06] text-white/75 hover:bg-white/[0.1] hover:text-white"
  ].join(" ");
}

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
    <div className="container-x py-20">
      <header className="text-center max-w-3xl mx-auto">
        <p className="eyebrow">Refurbished phones</p>
        <h1 className="mt-3 text-display-xl text-white tracking-tighter">
          Pre-loved. <span className="text-white/55">Properly tested.</span>
        </h1>
        <p className="mt-5 text-[18px] text-white/65 leading-relaxed">
          Every phone is inspected, cleaned and ships with a 30-day money-back guarantee and a 90-day warranty.
          Inventory rotates fast — call ahead to hold one for pickup.
        </p>
      </header>

      <div className="mt-14 flex flex-wrap justify-center gap-2">
        <Link href="/inventory" className={chipClass(!sp.city && !sp.brand)}>
          All
        </Link>
        {CITIES.map((c) => (
          <Link key={c.slug} href={`/inventory?city=${c.slug}`} className={chipClass(sp.city === c.slug)}>
            {c.name}
          </Link>
        ))}
      </div>

      {brands.length > 1 && (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {brands.map((b) => (
            <Link
              key={b}
              href={`/inventory?brand=${encodeURIComponent(b)}${sp.city ? `&city=${sp.city}` : ""}`}
              className={chipClass(sp.brand === b)}
            >
              {b}
            </Link>
          ))}
        </div>
      )}

      {phones.length === 0 ? (
        <div className="mt-16 card p-12 text-center max-w-xl mx-auto">
          <p className="text-white/70">No phones match this filter right now.</p>
          <Link href="/contact" className="mt-6 btn-primary inline-flex">Tell us what you&rsquo;re looking for</Link>
        </div>
      ) : (
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {phones.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 70}>
              <PhoneCard phone={p} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
