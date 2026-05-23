import Link from "next/link";
import { ANATOMY_MODELS } from "@/lib/iphone-anatomy";

export const metadata = {
  title: "How iPhones Work — Dave's Mobile Shop",
  description: "An illustrated guide to every part inside an iPhone, what it does, and how to fix it. iPhone 11 through iPhone 16."
};

export default function AnatomyIndexPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900">How iPhones work</h1>
        <p className="mt-3 text-gray-600">Click any model to see an illustrated breakdown of every part — what it does, how to fix it, and where to buy the replacement from us.</p>
      </header>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ANATOMY_MODELS.map((m) => (
          <Link key={m.slug} href={`/anatomy/${m.slug}`} className="card p-6 hover:shadow-md transition-shadow">
            <div className="text-6xl">📱</div>
            <h2 className="mt-3 text-xl font-semibold text-gray-900">{m.name}</h2>
            <p className="text-xs text-gray-500">{m.year} · {m.generation}</p>
            <p className="mt-2 text-sm text-gray-700">{m.introBlurb}</p>
            <span className="mt-4 inline-block text-sm font-medium text-brand-700">Explore parts →</span>
          </Link>
        ))}
      </div>
      <div className="mt-12 card p-6 bg-brand-50 border-brand-100">
        <h2 className="text-xl font-semibold text-brand-900">Got a different model?</h2>
        <p className="mt-2 text-sm text-brand-800">We service every iPhone from the 6s onward, plus most Samsung, Google Pixel and Sony devices. <Link href="/contact" className="underline">Contact us</Link> for help with a model not listed here.</p>
      </div>
    </div>
  );
}
