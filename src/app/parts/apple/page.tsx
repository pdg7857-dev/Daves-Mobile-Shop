import Link from "next/link";
import { PHONE_BRANDS } from "@/lib/phone-catalog";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Apple parts — Dave's Mobile Shop",
  description: "Pick your iPhone model to see compatible parts."
};

function groupByGeneration(models: { slug: string; name: string }[]) {
  // Extract generation label like "11 series", "12 series" ... "SE"
  const groups: Record<string, { slug: string; name: string }[]> = {};
  for (const m of models) {
    let key: string;
    if (m.name.includes("SE")) key = "SE";
    else {
      const match = m.name.match(/iPhone (\d+)/);
      key = match ? `${match[1]} series` : "Other";
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  }
  const order = ["16 series", "15 series", "14 series", "13 series", "12 series", "11 series", "SE"];
  return order
    .filter((k) => groups[k]?.length)
    .map((k) => ({ generation: k, models: groups[k] }));
}

export default function AppleModelsPage() {
  const apple = PHONE_BRANDS.find((b) => b.slug === "apple")!;
  const generations = groupByGeneration(apple.models);

  return (
    <div className="container-x py-20">
      <div className="text-center max-w-3xl mx-auto">
        <p className="eyebrow">Apple parts</p>
        <h1 className="mt-3 text-display-xl text-white tracking-tighter">
          Pick your iPhone.
        </h1>
        <p className="mt-5 text-[18px] text-white/65 leading-relaxed">
          Tap a model to see every screen, battery, camera and accessory we have for it.
        </p>
      </div>

      <div className="mt-14 space-y-12">
        {generations.map((gen, gi) => (
          <Reveal key={gen.generation} delay={gi * 60}>
            <section>
              <h2 className="eyebrow text-white/55 mb-4">iPhone {gen.generation}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {gen.models.map((m) => (
                  <Link
                    key={m.slug}
                    href={`/parts/apple/${m.slug}`}
                    className="card card-hover p-5 flex flex-col items-center text-center group"
                  >
                    <div className="w-16 h-20 rounded-xl bg-gradient-to-br from-[#2a2a2d] to-[#1d1d1f] flex items-center justify-center text-3xl mb-3 opacity-70 group-hover:opacity-100 transition-opacity">📱</div>
                    <p className="font-semibold text-[15px] text-white tracking-tight">{m.name}</p>
                    <p className="mt-3 link-chevron text-[12px]">See parts</p>
                  </Link>
                ))}
              </div>
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
