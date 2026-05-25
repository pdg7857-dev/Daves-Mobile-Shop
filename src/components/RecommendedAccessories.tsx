import Link from "next/link";
import { prisma } from "@/lib/db";
import { money } from "@/lib/format";

type Props = {
  // Pass the phone's brand so we prefer accessories that match
  brand?: string;
  /** Number of accessories to show. Default 4. */
  take?: number;
};

// Server component — queries top accessory SKUs and prefers brand-matching ones.
export default async function RecommendedAccessories({ brand, take = 4 }: Props) {
  const accessories = await prisma.part.findMany({
    where: { category: "accessory", stock: { gt: 0 } },
    orderBy: [{ stock: "desc" }, { name: "asc" }],
    take: 24
  });

  if (accessories.length === 0) return null;

  // Bubble brand-matching items to the top. Apple buyers see Apple accessories,
  // Samsung buyers see Samsung accessories, etc.
  const lowered = (brand || "").toLowerCase();
  const matchesBrand = (s: string) => s.toLowerCase().includes(lowered);
  const scored = accessories
    .map((p) => ({
      p,
      score:
        (lowered && (matchesBrand(p.brand || "") || matchesBrand(p.compatibleWith))
          ? 2
          : 0) +
        (lowered && matchesBrand(p.name) ? 1 : 0)
    }))
    .sort((a, b) => b.score - a.score);

  const picks = scored.slice(0, take).map((s) => s.p);

  return (
    <section className="mt-16">
      <div className="text-center max-w-3xl mx-auto">
        <p className="eyebrow">People often add</p>
        <h2 className="mt-2 text-display-md text-white tracking-tighter">
          Pair it with the essentials.
        </h2>
        <p className="mt-3 text-[15px] text-white/65">
          Chargers, cases and the little things that finish the setup.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {picks.map((part) => (
          <Link
            key={part.id}
            href={`/parts/${part.id}`}
            className="card card-hover flex flex-col group"
          >
            <div className="aspect-square bg-gradient-to-br from-[#2a2a2d] to-[#1d1d1f] flex items-center justify-center overflow-hidden">
              {part.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={part.imageUrl}
                  alt={part.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              ) : (
                <span className="text-5xl opacity-25">🔌</span>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              {part.brand && <p className="eyebrow text-white/45">{part.brand}</p>}
              <h3 className="mt-1.5 font-semibold text-[14px] text-white tracking-tight leading-snug">
                {part.name}
              </h3>
              <p className="mt-auto pt-3 text-[16px] font-semibold tracking-tight text-white">
                {money(part.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
