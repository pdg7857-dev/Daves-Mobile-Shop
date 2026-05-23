import { notFound } from "next/navigation";
import Link from "next/link";
import { ANATOMY_MODELS, getAnatomyModel, partsByPosition, VARIANT_LABEL, VARIANT_BADGE_COLOR } from "@/lib/iphone-anatomy";

export function generateStaticParams() {
  return ANATOMY_MODELS.map((m) => ({ model: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ model: string }> }) {
  const { model } = await params;
  const m = getAnatomyModel(model);
  if (!m) return { title: "Model not found" };
  return { title: `Inside the ${m.name} — Dave's Mobile Shop`, description: `${m.introBlurb} Detailed breakdown of every part inside the ${m.name} and how to fix it.` };
}

const POSITION_LABELS: Record<string, string> = {
  top: "Top edge — front camera & earpiece",
  upper: "Upper section — rear cameras & logic board",
  middle: "Center — battery",
  lower: "Lower section — Taptic Engine",
  bottom: "Bottom edge — charging port & speaker",
  back: "Rear glass & wireless charging",
  side: "Side buttons"
};

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "bg-green-100 text-green-800",
  Medium: "bg-amber-100 text-amber-800",
  Hard: "bg-orange-100 text-orange-800",
  Expert: "bg-red-100 text-red-800"
};

export default async function AnatomyModelPage({ params }: { params: Promise<{ model: string }> }) {
  const { model } = await params;
  const m = getAnatomyModel(model);
  if (!m) notFound();

  const grouped = partsByPosition(m.parts);
  const orderedPositions = ["top", "upper", "middle", "lower", "bottom", "side", "back"] as const;

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-700 to-brand-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/anatomy" className="text-sm text-brand-200 hover:text-white">← All models</Link>
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl md:text-5xl font-bold">Inside the {m.name}</h1>
            {m.variant && (
              <span className={`text-xs font-semibold uppercase tracking-wide rounded-full px-2.5 py-1 ${VARIANT_BADGE_COLOR[m.variant]}`}>{VARIANT_LABEL[m.variant]}</span>
            )}
          </div>
          <p className="mt-3 text-brand-100 max-w-3xl">{m.introBlurb}</p>
          <p className="mt-1 text-xs text-brand-200 uppercase tracking-wide">{m.year} · iPhone {m.generation}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-[280px,1fr] gap-10">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Diagram</h2>
          <div className="mt-3 mx-auto w-56 rounded-[2.5rem] border-[6px] border-gray-900 bg-gray-100 p-3 shadow-lg" aria-label={`${m.name} component layout`}>
            <div className="rounded-[1.75rem] bg-white overflow-hidden text-[10px] font-medium">
              {orderedPositions.filter((p) => p !== "back").map((p, i) => {
                const items = grouped[p];
                if (items.length === 0) return null;
                return (
                  <div key={p} className={`p-2 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"} border-b border-gray-100 last:border-b-0`}>
                    <div className="text-gray-500 uppercase tracking-wide text-[9px]">{p}</div>
                    <ul className="mt-0.5 space-y-0.5">
                      {items.map((part) => (<li key={part.key} className="text-gray-800">• {part.name}</li>))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
          {grouped.back.length > 0 && (<div className="mt-3 text-xs text-gray-500 text-center">Rear glass: {grouped.back.map((p) => p.name).join(", ")}</div>)}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">Every part, explained</h2>
          <p className="mt-1 text-sm text-gray-600">Tap a part to learn what it does, how hard the repair is, and where to grab the part.</p>
          <div className="mt-6 space-y-8">
            {orderedPositions.map((pos) => {
              const items = grouped[pos];
              if (items.length === 0) return null;
              return (
                <div key={pos}>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{POSITION_LABELS[pos] || pos}</h3>
                  <div className="mt-3 grid gap-3">
                    {items.map((p) => (
                      <details key={p.key} className="card p-4 group" data-anatomy-part={p.key}>
                        <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-semibold text-gray-900">{p.name}</span>
                            <span className={`text-xs rounded-full px-2 py-0.5 ${DIFFICULTY_COLOR[p.difficulty] || "bg-gray-100"}`}>{p.difficulty}</span>
                          </div>
                          <span className="text-brand-700 group-open:rotate-180 transition-transform" aria-hidden>▾</span>
                        </summary>
                        <div className="mt-3 space-y-3 text-sm">
                          <div>
                            <h4 className="text-xs font-semibold uppercase text-gray-500">What it does</h4>
                            <p className="mt-1 text-gray-800">{p.whatItDoes}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold uppercase text-gray-500">How to fix</h4>
                            <p className="mt-1 text-gray-800">{p.howToFix}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                            <Link href={`/parts?category=${encodeURIComponent(p.partCategory)}`} className="btn-secondary text-xs">Shop {p.partCategory.replace("-", " ")} parts →</Link>
                            <Link href="/contact" className="text-xs text-brand-700 hover:text-brand-900 self-center">Or have us fix it</Link>
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {(() => {
        const siblings = ANATOMY_MODELS.filter((other) => other.generation === m.generation && other.slug !== m.slug);
        if (siblings.length === 0) return null;
        return (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
            <h2 className="text-xl font-bold text-gray-900">Other iPhone {m.generation} variants</h2>
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {siblings.map((s) => (
                <Link key={s.slug} href={`/anatomy/${s.slug}`} className="card p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">📱</span>
                    {s.variant && (
                      <span className={`text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ${VARIANT_BADGE_COLOR[s.variant]}`}>{VARIANT_LABEL[s.variant]}</span>
                    )}
                  </div>
                  <h3 className="mt-2 font-semibold text-gray-900">{s.name}</h3>
                  <span className="mt-2 inline-block text-xs font-medium text-brand-700">Compare parts →</span>
                </Link>
              ))}
            </div>
          </section>
        );
      })()}

      <section className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl font-bold">Skip the DIY — drop it off with us</h2>
          <p className="mt-2 text-gray-300">We fix {m.name} screens, batteries and more, often same-day.</p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <Link href="/services" className="btn-primary">See repair pricing</Link>
            <Link href="/contact" className="btn-secondary">Get a quote</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
