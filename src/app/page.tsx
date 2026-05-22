import Link from "next/link";
import { prisma } from "@/lib/db";
import { SERVICES } from "@/lib/services";
import { CITIES } from "@/lib/cities";
import ServiceCard from "@/components/ServiceCard";
import PhoneCard from "@/components/PhoneCard";

export default async function HomePage() {
  const featured = await prisma.phone.findMany({
    where: { status: "for_sale" },
    orderBy: { createdAt: "desc" },
    take: 4
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 to-brand-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Phone broken? <span className="text-accent-500">We fix it today.</span>
            </h1>
            <p className="mt-5 text-lg text-brand-100 max-w-xl">
              Honest, fast mobile phone repair and quality refurbished phones.
              Serving the GTA, Montréal, Ottawa, Québec, Moncton and Halifax.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/services" className="btn bg-white text-brand-700 hover:bg-brand-50">
                See repair pricing
              </Link>
              <Link href="/inventory" className="btn border border-white/30 text-white hover:bg-white/10">
                Shop phones
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-100">
              <span>✓ 90-day warranty</span>
              <span>✓ OEM parts</span>
              <span>✓ Same-day service</span>
              <span>✓ Ship anywhere in Canada</span>
            </div>
          </div>
          <div className="hidden lg:flex justify-center">
            <div className="text-[14rem]">📱</div>
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Repair services</h2>
            <p className="mt-2 text-gray-600">Fixed-price quotes. Most done same day.</p>
          </div>
          <Link href="/services" className="hidden sm:inline-block text-sm font-medium text-brand-700 hover:text-brand-900">
            See all services →
          </Link>
        </div>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.slice(0, 4).map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </section>

      {/* Featured inventory */}
      {featured.length > 0 && (
        <section className="bg-white border-y border-gray-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Just in</h2>
                <p className="mt-2 text-gray-600">Tested, cleaned and ready to go.</p>
              </div>
              <Link href="/inventory" className="hidden sm:inline-block text-sm font-medium text-brand-700 hover:text-brand-900">
                See all phones →
              </Link>
            </div>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map((p) => (
                <PhoneCard key={p.id} phone={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cities */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900">Find us near you</h2>
        <p className="mt-2 text-gray-600">Locations across Eastern Canada.</p>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CITIES.map((city) => (
            <Link
              key={city.slug}
              href={`/locations/${city.slug}`}
              className="card p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-xs text-gray-500 uppercase tracking-wide">{city.province}</div>
              <h3 className="mt-1 text-xl font-semibold text-gray-900">{city.name}</h3>
              <p className="mt-2 text-sm text-gray-600">{city.tagline}</p>
              <span className="mt-4 inline-block text-sm font-medium text-brand-700">
                Visit this location →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold">Need a free quote?</h2>
          <p className="mt-3 text-gray-300">Tell us what&apos;s broken — we&apos;ll text you a price within an hour.</p>
          <Link href="/contact" className="mt-6 btn-primary inline-flex">
            Get a quote
          </Link>
        </div>
      </section>
    </div>
  );
}
