import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PartCard from "@/components/PartCard";
import Reveal from "@/components/Reveal";
import { PHONE_BRANDS } from "@/lib/phone-catalog";

export const dynamic = "force-dynamic";

type SearchParams = { category?: string };

function chipClass(active: boolean) {
  return [
    "text-[13px] rounded-full px-3.5 py-1.5 font-medium capitalize transition-colors",
    active ? "bg-white text-black" : "bg-white/[0.06] text-white/75 hover:bg-white/[0.1] hover:text-white"
  ].join(" ");
}

export default async function AndroidModelPartsPage({
  params,
  searchParams
}: {
  params: Promise<{ model: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { model: modelSlug } = await params;
  const sp = await searchParams;

  // Search Samsung + Google
  const candidate = PHONE_BRANDS
    .filter((b) => b.slug !== "apple")
    .flatMap((b) => b.models.map((m) => ({ brand: b, model: m })))
    .find(({ model }) => model.slug === modelSlug);
  if (!candidate) notFound();

  const { brand, model } = candidate;

  const where = {
    compatibleWith: { contains: model.name, mode: "insensitive" as const },
    ...(sp.category ? { category: sp.category } : {})
  };

  const [parts, categories] = await Promise.all([
    prisma.part.findMany({ where, orderBy: [{ category: "asc" }, { name: "asc" }] }),
    prisma.part.findMany({
      where: { compatibleWith: { contains: model.name, mode: "insensitive" as const } },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" }
    })
  ]);

  return (
    <div className="container-x py-20">
      <div className="text-center max-w-3xl mx-auto">
        <Link href="/parts/android" className="text-[13px] text-white/55 hover:text-white">
          ← All Android models
        </Link>
        <p className="eyebrow mt-4">{brand.name} · {model.name} parts</p>
        <h1 className="mt-3 text-display-xl text-white tracking-tighter">
          For your {model.name}.
        </h1>
        <p className="mt-5 text-[16px] text-white/65 leading-relaxed">
          {parts.length === 0
            ? "Nothing listed for this model yet — import a supplier catalog from /admin to stock it."
            : `${parts.length} part${parts.length === 1 ? "" : "s"} available.`}
        </p>
      </div>

      {categories.length > 1 && (
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          <Link href={`/parts/android/${model.slug}`} className={chipClass(!sp.category)}>
            All categories
          </Link>
          {categories.map((c) => (
            <Link
              key={c.category}
              href={`/parts/android/${model.slug}?category=${encodeURIComponent(c.category)}`}
              className={chipClass(sp.category === c.category)}
            >
              {c.category.replace("-", " ")}
            </Link>
          ))}
        </div>
      )}

      {parts.length > 0 && (
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {parts.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 60}>
              <PartCard part={p} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
