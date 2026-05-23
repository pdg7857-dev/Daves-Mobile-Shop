import { notFound } from "next/navigation";
import Link from "next/link";
import { getCity } from "@/lib/cities";
import { SERVICES } from "@/lib/services";
import { prisma } from "@/lib/db";
import PhoneCard from "@/components/PhoneCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const c = getCity(city);
  if (!c) return { title: "Location not found" };
  return { title: `${c.name} — Phone Repair & Refurbished Phones | Dave's Mobile Shop`, description: `${c.tagline} ${c.intro}` };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city) notFound();

  const phones = await prisma.phone.findMany({ where: { status: "for_sale", city: slug }, orderBy: { createdAt: "desc" }, take: 8 });

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-700 to-brand-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <span className="text-sm uppercase tracking-wide text-brand-200">{city.province}</span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">{city.name}</h1>
          <p className="mt-4 text-lg text-brand-100 max-w-3xl">{city.tagline}</p>
          <p className="mt-2 text-brand-100 max-w-3xl">{city.intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="btn bg-white text-brand-700 hover:bg-brand-50">Get a quote</Link>
            <Link href={`/inventory?city=${city.slug}`} className="btn border border-white/30 text-white hover:bg-white/10">See phones at this location</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-3 gap-6">
        <div className="card p-6"><h3 className="font-semibold text-white">Hours</h3><p className="mt-2 text-sm text-gray-300">{city.hours}</p></div>
        <div className="card p-6"><h3 className="font-semibold text-white">Turnaround</h3><p className="mt-2 text-sm text-gray-300">{city.turnaround}</p></div>
        <div className="card p-6"><h3 className="font-semibold text-white">Coverage area</h3><p className="mt-2 text-sm text-gray-300">{city.neighborhoods.join(" · ")}</p></div>
      </section>

      {phones.length > 0 && (
        <section className="bg-gray-900/40 border-y border-gray-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-end justify-between">
              <h2 className="text-3xl font-bold text-white">In stock at {city.name}</h2>
              <Link href={`/inventory?city=${city.slug}`} className="text-sm font-medium text-brand-300 hover:text-brand-200">See all →</Link>
            </div>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{phones.map((p) => (<PhoneCard key={p.id} phone={p} />))}</div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-white">Services we offer here</h2>
        <p className="mt-2 text-gray-400">All standard repairs are available at every location.</p>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((s) => (
            <div key={s.slug} className="card p-5">
              <div className="text-2xl">{s.icon}</div>
              <h3 className="mt-2 font-semibold text-white">{s.name}</h3>
              <p className="mt-1 text-sm text-gray-400">{s.short}</p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-brand-300">From {s.startingPrice}</span>
                <span className="text-gray-500">{s.turnaround}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-white">FAQ — {city.name}</h2>
        <div className="mt-6 max-w-3xl space-y-3">
          {city.faqs.map((f, i) => (
            <details key={i} className="card p-4 group">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
                <span className="font-medium text-white">{f.q}</span>
                <span className="text-brand-300 group-open:rotate-180 transition-transform" aria-hidden>▾</span>
              </summary>
              <p className="mt-3 text-sm text-gray-300">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-brand-900 to-gray-900 border-y border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-white">Ready to fix your phone in {city.name}?</h2>
          <p className="mt-2 text-gray-300">Walk in or text us a photo for a quote.</p>
          <div className="mt-6 flex justify-center gap-3">
            <a href={`tel:${process.env.NEXT_PUBLIC_BUSINESS_PHONE || ""}`} className="btn-primary">Call now</a>
            <Link href="/contact" className="btn-secondary">Get a quote</Link>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "LocalBusiness", name: `Dave's Mobile Shop — ${city.name}`, description: city.intro, address: { "@type": "PostalAddress", streetAddress: city.streetAddress ?? undefined, addressLocality: city.name.replace(/\s*\(.*\)\s*/, ""), addressRegion: city.isoRegion, addressCountry: "CA" }, telephone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || undefined, email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || undefined, areaServed: city.neighborhoods.map((n) => ({ "@type": "Place", name: n })), openingHours: city.hours, priceRange: "$$" }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: city.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }) }} />
    </div>
  );
}
