import Link from "next/link";
import { prisma } from "@/lib/db";
import PartCard from "@/components/PartCard";

export const metadata = {
  title: "Phone Parts — Dave's Mobile Shop",
  description: "Screens, batteries, charging ports, cameras and more for iPhone, Samsung, Pixel and more."
};

export const dynamic = "force-dynamic";

type SearchParams = { category?: string };

function chipClass(active: boolean) {
  return [
    "text-[13px] rounded-full px-3.5 py-1.5 font-medium capitalize transition-colors",
    active
      ? "bg-white text-black"
      : "bg-white/[0.06] text-white/75 hover:bg-white/[0.1] hover:text-white"
  ].join(" ");
}

export default async function PartsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const where = sp.category ? { category: sp.category } : {};
  const parts = await prisma.part.findMany({
    where,
    orderBy: [{ category: "asc" }, { name: "asc" }]
  });

  const categories = await prisma.part.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" }
  });

  return (
    <div className="container-x py-20">
      <header className="text-center max-w-3xl mx-auto">
        <p className="eyebrow">Phone parts</p>
        <h1 className="mt-3 text-display-xl text-white tracking-tighter">
          Genuine. Tested. <span className="text-white/55">In stock.</span>
        </h1>
        <p className="mt-5 text-[18px] text-white/65 leading-relaxed">
          OEM and aftermarket parts for technicians and DIY repairs.
          Wholesale pricing on bulk orders — just ask.
        </p>
      </header>

      <div className="mt-14 flex flex-wrap justify-center gap-2">
        <Link href="/parts" className={chipClass(!sp.category)}>All categories</Link>
        {categories.map((c) => (
          <Link
            key={c.category}
            href={`/parts?category=${encodeURIComponent(c.category)}`}
            className={chipClass(sp.category === c.category)}
          >
            {c.category.replace("-", " ")}
          </Link>
        ))}
      </div>

      {parts.length === 0 ? (
        <p className="mt-16 text-center text-white/55">No parts in this category right now.</p>
      ) : (
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {parts.map((p) => (
            <PartCard key={p.id} part={p} />
          ))}
        </div>
      )}
    </div>
  );
}
