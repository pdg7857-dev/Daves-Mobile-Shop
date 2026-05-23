import Link from "next/link";
import { prisma } from "@/lib/db";
import { SERVICES } from "@/lib/services";
import { CITIES } from "@/lib/cities";
import ServiceCard from "@/components/ServiceCard";
import PhoneCard from "@/components/PhoneCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await prisma.phone.findMany({
    where: { status: "for_sale" },
    orderBy: { createdAt: "desc" },
    take: 4
  });

  return (
    <div className="space-y-2">
      {/* ===================== HERO ===================== */}
      <section className="hero-radial">
        <div className="container-narrow text-center pt-24 pb-20 sm:pt-32 sm:pb-28">
          <p className="eyebrow animate-fade-up">Dave&rsquo;s Mobile Shop</p>
          <h1 className="mt-3 text-display-2xl text-white animate-fade-up [animation-delay:60ms]">
            Phones, repaired.
            <br />
            <span className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
              Reborn.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[19px] leading-relaxed text-white/70 animate-fade-up [animation-delay:120ms]">
            Honest, same-day repair on every iPhone, Samsung and Pixel.
            Quality refurbished devices, OEM parts, 90-day warranty —
            shipped Canada-wide.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 animate-fade-up [animation-delay:180ms]">
            <Link href="/services" className="link-chevron">See repair pricing</Link>
            <Link href="/inventory" className="link-chevron">Shop phones</Link>
            <Link href="/contact" className="link-chevron">Get a quote</Link>
          </div>
        </div>
      </section>

      {/* ===================== BENTO HIGHLIGHTS ===================== */}
      <section className="container-x py-3">
        <div className="grid gap-3 lg:grid-cols-2">
          {/* Big repair tile */}
          <Link
            href="/services"
            className="group card panel-gradient relative isolate min-h-[520px] flex flex-col p-10 sm:p-14 overflow-hidden card-hover"
          >
            <div className="relative z-10">
              <p className="eyebrow">Repair</p>
              <h2 className="mt-3 text-display-lg text-white">
                Same-day fix.
                <br />
                Lifetime peace of mind.
              </h2>
              <p className="mt-4 text-[17px] text-white/70 max-w-md">
                Screens, batteries, cameras, charging ports. Fixed-price quotes,
                OEM parts and a 90-day workmanship warranty.
              </p>
              <p className="mt-7 link-chevron">Book a repair</p>
            </div>
            <div
              className="pointer-events-none absolute -right-20 -bottom-24 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl transition-opacity group-hover:opacity-50"
              style={{ background: "radial-gradient(circle, #0071e3 0%, transparent 65%)" }}
            />
          </Link>

          {/* Big shop tile */}
          <Link
            href="/inventory"
            className="group card relative isolate min-h-[520px] flex flex-col p-10 sm:p-14 overflow-hidden card-hover"
            style={{ background: "linear-gradient(135deg, #1d1d1f 0%, #2a2a2d 60%, #1d1d1f 100%)" }}
          >
            <div className="relative z-10">
              <p className="eyebrow text-white/60">Refurbished</p>
              <h2 className="mt-3 text-display-lg text-white">
                Pre-loved.
                <br />
                Fully tested.
              </h2>
              <p className="mt-4 text-[17px] text-white/70 max-w-md">
                Every device inspected, cleaned and certified. iPhones, Samsungs,
                Pixels — with 30-day money-back, 90-day warranty.
              </p>
              <p className="mt-7 link-chevron">Shop the lineup</p>
            </div>
            <div
              className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full opacity-25 blur-3xl"
              style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 65%)" }}
            />
          </Link>
        </div>

        {/* Smaller tile row */}
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="card panel-gradient p-8 min-h-[200px] flex flex-col justify-between">
            <div>
              <p className="eyebrow">90-day</p>
              <p className="mt-2 text-display-md text-white">Warranty</p>
            </div>
            <p className="text-[14px] text-white/55">On every repair we ship out the door.</p>
          </div>
          <div className="card panel-gradient p-8 min-h-[200px] flex flex-col justify-between">
            <div>
              <p className="eyebrow">OEM</p>
              <p className="mt-2 text-display-md text-white">Parts only</p>
            </div>
            <p className="text-[14px] text-white/55">Genuine parts wherever possible. Always disclosed.</p>
          </div>
          <div className="card panel-gradient p-8 min-h-[200px] flex flex-col justify-between">
            <div>
              <p className="eyebrow">Free shipping</p>
              <p className="mt-2 text-display-md text-white">Across Canada</p>
            </div>
            <p className="text-[14px] text-white/55">On orders over $200. Tracked, insured.</p>
          </div>
        </div>
      </section>

      {/* ===================== SERVICES ===================== */}
      <section className="container-x pt-20 pb-8">
        <div className="text-center max-w-3xl mx-auto">
          <p className="eyebrow">What we fix</p>
          <h2 className="mt-3 text-display-lg text-white tracking-tighter">
            Every screen. Every battery.
            <span className="text-white/55"> Every time.</span>
          </h2>
          <p className="mt-5 text-[17px] text-white/65">
            Fixed-price quotes. Most jobs done same day.
          </p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SERVICES.slice(0, 4).map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/services" className="link-chevron">See all services</Link>
        </div>
      </section>

      {/* ===================== FEATURED PHONES ===================== */}
      {featured.length > 0 && (
        <section className="container-x pt-20 pb-8">
          <div className="text-center max-w-3xl mx-auto">
            <p className="eyebrow">Just in</p>
            <h2 className="mt-3 text-display-lg text-white tracking-tighter">
              Tested. Cleaned. <span className="text-white/55">Ready to go.</span>
            </h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {featured.map((p) => (
              <PhoneCard key={p.id} phone={p} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/inventory" className="link-chevron">Browse all phones</Link>
          </div>
        </section>
      )}

      {/* ===================== LOCATIONS ===================== */}
      <section className="container-x pt-20 pb-8">
        <div className="text-center max-w-3xl mx-auto">
          <p className="eyebrow">Coast to coast (almost)</p>
          <h2 className="mt-3 text-display-lg text-white tracking-tighter">
            Find a shop near you.
          </h2>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CITIES.map((city) => (
            <Link
              key={city.slug}
              href={`/locations/${city.slug}`}
              className="card card-hover p-8 group"
            >
              <p className="eyebrow text-white/50">{city.province}</p>
              <h3 className="mt-2 text-2xl font-semibold text-white tracking-tight">{city.name}</h3>
              <p className="mt-3 text-[14px] text-white/60 leading-relaxed">{city.tagline}</p>
              <p className="mt-5 link-chevron text-[14px]">Visit location</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="container-x py-24">
        <div className="card panel-gradient text-center p-12 sm:p-20">
          <p className="eyebrow">Free quote in under an hour</p>
          <h2 className="mt-3 text-display-lg text-white tracking-tighter">
            Phone broken?
            <br />
            <span className="text-white/55">Tell us. We&rsquo;ll fix it.</span>
          </h2>
          <p className="mt-5 text-[17px] text-white/65 max-w-xl mx-auto">
            Text or call us with the device + issue and we&rsquo;ll send back a fixed price within an hour.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn-primary">Get a quote</Link>
            <Link href="/services" className="btn-secondary">See pricing</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
