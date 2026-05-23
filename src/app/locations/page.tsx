import Link from "next/link";
import { CITIES } from "@/lib/cities";

export const metadata = {
  title: "Our Locations — Dave's Mobile Shop",
  description: "Find your nearest Dave's Mobile Shop location across Eastern Canada."
};

export default function LocationsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold text-white">Our locations</h1>
        <p className="mt-3 text-gray-400">
          Six cities across Eastern Canada. Each shop carries its own inventory of refurbished phones and parts —
          tap a city to see what&apos;s in stock there.
        </p>
      </header>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CITIES.map((c) => (
          <Link
            key={c.slug}
            href={`/locations/${c.slug}`}
            className="card p-6 hover:border-brand-500 transition-colors"
          >
            <span className="text-xs uppercase tracking-wide text-gray-500">{c.province}</span>
            <h2 className="mt-1 text-2xl font-semibold text-white">{c.name}</h2>
            <p className="mt-2 text-sm text-gray-300">{c.tagline}</p>
            <p className="mt-3 text-xs text-gray-500">{c.hours}</p>
            <span className="mt-4 inline-block text-sm font-medium text-brand-300">
              View location →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
