import Link from "next/link";
import { ANATOMY_MODELS, groupedByGeneration, VARIANT_LABEL, VARIANT_BADGE_COLOR } from "@/lib/iphone-anatomy";

export const metadata = {
  title: "How iPhones Work — Dave's Mobile Shop",
  description: "An illustrated guide to every part inside every iPhone variant — SE, mini, standard, Plus, Pro, Pro Max. iPhone 11 through iPhone 16."
};

export default function AnatomyIndexPage() {
  const groups = groupedByGeneration();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900">How iPhones work</h1>
        <p className="mt-3 text-gray-600">Every variant Apple has shipped since the iPhone SE — mini, standard, Plus, Pro and Pro Max. Click a model to see what&apos;s inside, how each part works, and where to buy the replacement.</p>
        <p className="mt-3 text-sm text-gray-500">{ANATOMY_MODELS.length} models documented.</p>
      </header>

      <div className="mt-10 space-y-10">
        {groups.map((g) => (
          <section key={g.generation}>
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold text-gray-900">iPhone {g.generation}</h2>
              <span className="text-sm text-gray-500">{g.models[0]?.year}{g.models.length > 1 && g.models[0]?.year !== g.models.at(-1)?.year ? `–${g.models.at(-1)?.year}` : ""}</span>
            </div>
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {g.models.map((m) => (
                <Link key={m.slug} href={`/anatomy/${m.slug}`} className="card p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">📱</span>
                    {m.variant && (
                      <span className={`text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ${VARIANT_BADGE_COLOR[m.variant]}`}>{VARIANT_LABEL[m.variant]}</span>
                    )}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-gray-900">{m.name}</h3>
                  <p className="text-xs text-gray-500">{m.year}</p>
                  <p className="mt-2 text-xs text-gray-700 line-clamp-3">{m.introBlurb}</p>
                  <span className="mt-3 inline-block text-sm font-medium text-brand-700">Explore parts →</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-14 card p-6 bg-brand-50 border-brand-100">
        <h2 className="text-xl font-semibold text-brand-900">Don&apos;t see your model?</h2>
        <p className="mt-2 text-sm text-brand-800">We also service iPhone 8 and earlier, plus most Samsung Galaxy, Google Pixel and Sony Xperia devices. <Link href="/contact" className="underline">Contact us</Link> for help with a model not listed here.</p>
      </div>
    </div>
  );
}
