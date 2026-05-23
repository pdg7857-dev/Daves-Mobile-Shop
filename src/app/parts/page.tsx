import Link from "next/link";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Parts — Dave's Mobile Shop",
  description: "Shop OEM and aftermarket parts by brand, model and category. Plus repair guides and the tools to do it yourself."
};

const TILES = [
  {
    href: "/anatomy",
    eyebrow: "Repair guides",
    title: "How to fix your phone",
    body: "Step-by-step iPhone teardowns. Learn what every part does and how it's swapped.",
    accent: "from-amber-500/30 to-orange-500/10",
    glow: "#f59e0b"
  },
  {
    href: "/parts/apple",
    eyebrow: "iPhone parts",
    title: "Apple parts",
    body: "Screens, batteries, cameras, charging ports for every iPhone from SE through 16 Pro Max.",
    accent: "from-[color:var(--apple-blue)]/30 to-[color:var(--apple-blue)]/5",
    glow: "#0071e3"
  },
  {
    href: "/parts/android",
    eyebrow: "Samsung & Pixel parts",
    title: "Android parts",
    body: "Galaxy S, Z Flip, Z Fold, A-series and every Pixel from 6 onwards.",
    accent: "from-emerald-500/30 to-emerald-500/5",
    glow: "#10b981"
  },
  {
    href: "/parts/tools",
    eyebrow: "Pro workbench",
    title: "Tools & equipment",
    body: "Heat mats, opening picks, suction cups, precision drivers — everything a tech needs.",
    accent: "from-purple-500/30 to-purple-500/5",
    glow: "#a855f7"
  }
] as const;

export default function PartsHubPage() {
  return (
    <div className="container-x py-20">
      <header className="text-center max-w-3xl mx-auto">
        <p className="eyebrow">Parts</p>
        <h1 className="mt-3 text-display-xl text-white tracking-tighter">
          What are you fixing?
        </h1>
        <p className="mt-5 text-[18px] text-white/65 leading-relaxed">
          Pick a path — by repair guide, by brand, or grab the tools to do it yourself.
        </p>
      </header>

      <div className="mt-14 grid gap-3 sm:grid-cols-2">
        {TILES.map((tile, i) => (
          <Reveal key={tile.href} delay={i * 80}>
            <Link
              href={tile.href}
              className={`card card-hover relative isolate min-h-[300px] sm:min-h-[340px] flex flex-col p-10 overflow-hidden bg-gradient-to-br ${tile.accent} block group`}
            >
              <div className="relative z-10 flex-1 flex flex-col">
                <p className="eyebrow text-white/70">{tile.eyebrow}</p>
                <h2 className="mt-3 text-display-md text-white tracking-tighter">{tile.title}</h2>
                <p className="mt-3 text-[15px] text-white/70 leading-relaxed max-w-md">{tile.body}</p>
                <p className="mt-auto pt-6 link-chevron text-[14px]">Browse</p>
              </div>
              <div
                className="pointer-events-none absolute -right-16 -bottom-20 h-[320px] w-[320px] rounded-full opacity-30 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
                style={{ background: `radial-gradient(circle, ${tile.glow} 0%, transparent 65%)` }}
              />
            </Link>
          </Reveal>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/parts/all" className="link-chevron text-[14px]">
          Or browse the full catalog
        </Link>
      </div>
    </div>
  );
}
