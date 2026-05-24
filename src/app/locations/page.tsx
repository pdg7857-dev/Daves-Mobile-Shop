import Link from "next/link";
import { CITIES, UNIVERSAL_HOURS, EMERGENCY_NOTE } from "@/lib/cities";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Service Areas — Nationwide Phone Repair | Dave's Mobile Shop",
  description: "We ship to every major city in Canada — Toronto, Vancouver, Montréal, Calgary, Ottawa and more. Mail-in phone repair with 180-day warranty. Open 7 days a week 8 AM – 9 PM ET."
};

export default function LocationsPage() {
  return (
    <div className="container-x py-20">
      <header className="text-center max-w-3xl mx-auto">
        <p className="eyebrow">Nationwide service</p>
        <h1 className="mt-3 text-display-xl text-white tracking-tighter">
          We&rsquo;re wherever you are.
        </h1>
        <p className="mt-5 text-[18px] text-white/65 leading-relaxed">
          Mail-in phone repair and refurbished phone delivery across every major Canadian city.
          {" "}
          <span className="text-white/85 font-medium">{UNIVERSAL_HOURS}.</span>
          {" "}
          {EMERGENCY_NOTE}
        </p>
      </header>

      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CITIES.map((c, i) => (
          <Reveal key={c.slug} delay={(i % 6) * 50}>
            <Link
              href={`/locations/${c.slug}`}
              className="card card-hover p-7 block group h-full"
            >
              <p className="eyebrow text-white/50">{c.province}</p>
              <h2 className="mt-2 text-[24px] font-semibold text-white tracking-tighter">{c.name}</h2>
              <p className="mt-3 text-[13px] text-white/65 leading-relaxed line-clamp-3">{c.tagline}</p>
              <p className="mt-5 link-chevron text-[13px]">View {c.name}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
