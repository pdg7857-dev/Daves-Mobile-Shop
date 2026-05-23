import Link from "next/link";
import { CITIES } from "@/lib/cities";

export const metadata = {
  title: "Our Locations — Dave's Mobile Shop",
  description: "Find your nearest Dave's Mobile Shop location across Eastern Canada."
};

export default function LocationsPage() {
  return (
    <div className="container-x py-20">
      <header className="text-center max-w-3xl mx-auto">
        <p className="eyebrow">Find us</p>
        <h1 className="mt-3 text-display-xl text-white tracking-tighter">
          Six shops. <span className="text-white/55">One promise.</span>
        </h1>
        <p className="mt-5 text-[18px] text-white/65 leading-relaxed">
          Each location carries its own inventory of refurbished phones and parts.
          Tap a city to see what&rsquo;s in stock there.
        </p>
      </header>

      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CITIES.map((c) => (
          <Link
            key={c.slug}
            href={`/locations/${c.slug}`}
            className="card card-hover p-8"
          >
            <p className="eyebrow text-white/50">{c.province}</p>
            <h2 className="mt-2 text-[28px] font-semibold text-white tracking-tighter">{c.name}</h2>
            <p className="mt-3 text-[14px] text-white/65 leading-relaxed">{c.tagline}</p>
            <p className="mt-4 text-[12px] text-white/45">{c.hours}</p>
            <p className="mt-6 link-chevron text-[14px]">View location</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
