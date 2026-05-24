import { prisma } from "@/lib/db";
import PhoneCard from "@/components/PhoneCard";
import Link from "next/link";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Refurbished Phones Canada — iPhones, Samsung, Pixel | 180-Day Warranty",
  description:
    "Buy certified refurbished iPhones, Samsungs and Pixels with a 180-day warranty. Free Canada-wide shipping over $200. Every phone tested and cleaned.",
  keywords: [
    "refurbished iPhone Canada", "used iPhone Canada", "certified refurbished phones",
    "buy used Samsung Canada", "refurbished Pixel Canada", "second hand iPhone",
    "iPhone 15 Pro refurbished", "iPhone 16 refurbished Canada"
  ]
};

export const dynamic = "force-dynamic";

type SearchParams = { brand?: string };

function chipClass(active: boolean) {
  return [
    "text-[13px] rounded-full px-3.5 py-1.5 font-medium transition-colors",
    active ? "bg-white text-black" : "bg-white/[0.06] text-white/75 hover:bg-white/[0.1] hover:text-white"
  ].join(" ");
}

export default async function InventoryPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const where: { status: string; brand?: string } = { status: "for_sale" };
  if (sp.brand) where.brand = sp.brand;

  const phones = await prisma.phone.findMany({ where, orderBy: [{ createdAt: "desc" }] });

  // Brand list from ALL for-sale phones (so chips stay stable when one is selected)
  const allBrands = await prisma.phone.findMany({
    where: { status: "for_sale" },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" }
  });

  return (
    <div className="container-x py-20">
      <header className="text-center max-w-3xl mx-auto">
        <p className="eyebrow">Refurbished phones</p>
        <h1 className="mt-3 text-display-xl text-white tracking-tighter">
          Pre-loved. <span className="text-white/55">Properly tested.</span>
        </h1>
        <p className="mt-5 text-[18px] text-white/65 leading-relaxed">
          Every phone is inspected, cleaned and ships with a <strong className="text-white">180-day warranty</strong> and 30-day money-back guarantee.
          Free Canada-wide shipping on orders over $200.
        </p>
      </header>

      {allBrands.length > 1 && (
        <div className="mt-14 flex flex-wrap justify-center gap-2">
          <Link href="/inventory" className={chipClass(!sp.brand)}>All brands</Link>
          {allBrands.map((b) => (
            <Link key={b.brand} href={`/inventory?brand=${encodeURIComponent(b.brand)}`} className={chipClass(sp.brand === b.brand)}>
              {b.brand}
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
