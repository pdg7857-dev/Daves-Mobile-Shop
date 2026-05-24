import { notFound } from "next/navigation";
import Link from "next/link";
import { getCity, UNIVERSAL_HOURS, EMERGENCY_NOTE } from "@/lib/cities";
import { SERVICES } from "@/lib/services";
import { prisma } from "@/lib/db";
import PhoneCard from "@/components/PhoneCard";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const c = getCity(city);
  if (!c) return { title: "Service area not found" };
  return {
    title: `Phone Repair in ${c.name}, ${c.province} | Dave's Mobile Shop`,
    description: `${c.tagline} ${c.intro} 180-day warranty. Open 7 days a week 8 AM – 9 PM ET. Emergency repairs available.`,
    keywords: [
      `phone repair ${c.name}`,
      `iPhone repair ${c.name}`,
      `Samsung repair ${c.name}`,
      `mail-in phone repair ${c.province}`,
      `refurbished phones ${c.name}`,
      ...c.neighborhoods.map((n) => `phone repair ${n}`)
    ]
  };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city) notFound();

  const phones = await prisma.phone.findMany({
    where: { status: "for_sale" },
    orderBy: { createdAt: "desc" },
    take: 8
  });

  return (
    <div>
      <section className="hero-radial">
        <div className="container-narrow text-center pt-20 pb-16">
          <p className="eyebrow">{city.province} · Mail-in service</p>
          <h1 className="mt-3 text-display-xl text-white tracking-tighter">{city.name}</h1>
          <p className="mt-5 text-[18px] text-white/70 max-w-2xl mx-auto leading-relaxed">
            {city.tagline}
          </p>
          <p className="mt-3 text-[15px] text-white/55 max-w-2xl mx-auto leading-relaxed">
            {city.intro}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            <Link href="/contact" className="link-chevron">Get a free quote</Link>
            <Link href="/inventory" className="link-chevron">Shop refurbished phones</Link>
            <Link href="/services" className="link-chevron">See repair pricing</Link>
          </div>
        </div>
      </section>

      <section className="container-x py-10">
        <div className="grid sm:grid-cols-3 gap-3">
          <Reveal>
            <div className="card p-7 h-full">
              <p className="eyebrow text-[color:var(--apple-blue)]">Hours</p>
              <h3 className="mt-2 text-[20px] font-semibold text-white tracking-tight">{UNIVERSAL_HOURS}</h3>
              <p className="mt-2 text-[14px] text-white/65">{EMERGENCY_NOTE}</p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="card p-7 h-full">
              <p className="eyebrow text-[color:var(--apple-blue)]">Turnaround</p>
              <h3 className="mt-2 text-[20px] font-semibold text-white tracking-tight">24–48 hours</h3>
              <p className="mt-2 text-[14px] text-white/65">{city.turnaround}</p>
            </div>
          </Reveal>
          <Reveal delay={160}>
            <div className="card p-7 h-full">
              <p className="eyebrow text-[color:var(--apple-blue)]">Coverage</p>
              <h3 className="mt-2 text-[20px] font-semibold text-white tracking-tight">{city.name} & nearby</h3>
              <p className="mt-2 text-[14px] text-white/65 leading-relaxed">{city.neighborhoods.join(" · ")}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {phones.length > 0 && (
        <section className="container-x py-10">
          <div className="text-center max-w-3xl mx-auto">
            <p className="eyebrow">Ships to {city.name}</p>
            <h2 className="mt-2 text-display-md text-white tracking-tighter">
              Refurbished phones, free shipping.
            </h2>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {phones.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 60}>
                <PhoneCard phone={p} />
              </Reveal>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/inventory" className="link-chevron">Browse all phones</Link>
          </div>
        </section>
      )}

      <section className="container-x py-16">
        <div className="text-center max-w-3xl mx-auto">
          <p className="eyebrow">What we fix</p>
          <h2 className="mt-2 text-display-md text-white tracking-tighter">
            Every repair, fixed price.
          </h2>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SERVICES.map((s) => (
            <div key={s.slug} className="card p-6">
              <div className="text-2xl">{s.icon}</div>
              <h3 className="mt-2 font-semibold text-white tracking-tight">{s.name}</h3>
              <p className="mt-1 text-[13px] text-white/55">{s.short}</p>
              <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[13px]">
                <span className="font-semibold text-white">From {s.startingPrice}</span>
                <span className="text-white/50">{s.turnaround}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-10">
        <div className="text-center max-w-3xl mx-auto">
          <p className="eyebrow">Frequently asked</p>
          <h2 className="mt-2 text-display-md text-white tracking-tighter">
            Common questions from {city.name}.
          </h2>
        </div>
        <div className="mt-10 max-w-3xl mx-auto space-y-3">
          {city.faqs.map((f, i) => (
            <details key={i} className="card p-5 group">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
                <span className="font-medium text-white tracking-tight">{f.q}</span>
                <span className="text-[color:var(--apple-blue)] group-open:rotate-180 transition-transform" aria-hidden>▾</span>
              </summary>
              <p className="mt-3 text-[14px] text-white/70 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="container-x py-16">
        <div className="card panel-gradient text-center p-12 sm:p-16">
          <p className="eyebrow">Free quote in under an hour</p>
          <h2 className="mt-3 text-display-md text-white tracking-tighter">
            Phone broken in {city.name}?
          </h2>
          <p className="mt-4 text-[15px] text-white/65 max-w-xl mx-auto">
            Message us a photo of the damage and we&rsquo;ll send back a fixed price.
            We&rsquo;ll mail you a free prepaid shipping label same day.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn-primary">Get a quote</Link>
            <Link href="/services" className="btn-secondary">See pricing</Link>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: `Dave's Mobile Shop — ${city.name}`,
            description: city.intro,
            address: {
              "@type": "PostalAddress",
              addressLocality: city.name.replace(/\s*\(.*\)\s*/, ""),
              addressRegion: city.isoRegion,
              addressCountry: "CA"
            },
            telephone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || undefined,
            email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || undefined,
            areaServed: city.neighborhoods.map((n) => ({ "@type": "Place", name: n })),
            openingHoursSpecification: {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              opens: "08:00",
              closes: "21:00"
            },
            priceRange: "$$"
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: city.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a }
            }))
          })
        }}
      />
    </div>
  );
}
