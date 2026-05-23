import Link from "next/link";
import { prisma } from "@/lib/db";
import { SERVICES } from "@/lib/services";
import { CITIES } from "@/lib/cities";
import ServiceCard from "@/components/ServiceCard";
import PhoneCard from "@/components/PhoneCard";
import Reveal from "@/components/Reveal";

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
            Quality refurbished devices with a <strong className="text-white/90">180-day warranty</strong>, OEM parts,
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
          <Reveal>
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
                className="pointer-events-none absolute -right-20 -bottom-24 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl transition-opacity duration-700 group-hover:opacity-60"
                style={{ background: "radial-gradient(circle, #0071e3 0%, transparent 65%)" }}
              />
            </Link>
          </Reveal>

          <Reveal delay={100}>
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
                  Pixels — with a 180-day warranty and 30-day money-back guarantee.
                </p>
                <p className="mt-7 link-chevron">Shop the lineup</p>
              </div>
              <div
                className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full opacity-25 blur-3xl transition-opacity duration-700 group-hover:opacity-50"
                style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 65%)" }}
              />
            </Link>
          </Reveal>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            { eyebrow: "180-day", title: "On every phone", body: "Full warranty on every refurbished device we ship." },
            { eyebrow: "90-day", title: "On every repair", body: "Workmanship warranty across all our repair services." },
            { eyebrow: "Free shipping", title: "Across Canada", body: "On orders over $200. Tracked, insured, no surprises." }
          ].map((stat, i) => (
            <Reveal key={stat.title} delay={i * 80}>
              <div className="card panel-gradient p-8 min-h-[200px] flex flex-col justify-between card-hover">
                <div>
                  <p className="eyebrow">{stat.eyebrow}</p>
                  <p className="mt-2 text-display-md text-white">{stat.title}</p>
                </div>
                <p className="text-[14px] text-white/55">{stat.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===================== SERVICES ===================== */}
      <section className="container-x pt-20 pb-8">
        <Reveal>
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
        </Reveal>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SERVICES.slice(0, 4).map((s, i) => (
            <Reveal key={s.slug} delay={i * 80}>
              <ServiceCard service={s} />
            </Reveal>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/services" className="link-chevron">See all services</Link>
        </div>
      </section>

      {/* ===================== FEATURED PHONES ===================== */}
      {featured.length > 0 && (
        <section className="container-x pt-20 pb-8">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto">
              <p className="eyebrow">Just in</p>
              <h2 className="mt-3 text-display-lg text-white tracking-tighter">
                Tested. Cleaned. <span className="text-white/55">Ready to go.</span>
              </h2>
            </div>
          </Reveal>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <PhoneCard phone={p} />
              </Reveal>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/inventory" className="link-chevron">Browse all phones</Link>
          </div>
        </section>
      )}

      {/* ===================== LOCATIONS ===================== */}
      <section className="container-x pt-20 pb-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto">
            <p className="eyebrow">Coast to coast (almost)</p>
            <h2 className="mt-3 text-display-lg text-white tracking-tighter">
              Find a shop near you.
            </h2>
          </div>
        </Reveal>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CITIES.map((city, i) => (
            <Reveal key={city.slug} delay={i * 60}>
              <Link
                href={`/locations/${city.slug}`}
                className="card card-hover p-8 group block"
              >
                <p className="eyebrow text-white/50">{city.province}</p>
                <h3 className="mt-2 text-2xl font-semibold text-white tracking-tight">{city.name}</h3>
                <p className="mt-3 text-[14px] text-white/60 leading-relaxed">{city.tagline}</p>
                <p className="mt-5 link-chevron text-[14px]">Visit location</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="container-x py-24">
        <Reveal>
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
        </Reveal>
      </section>
    </div>
  );
}
