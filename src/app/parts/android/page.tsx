import Link from "next/link";
import { PHONE_BRANDS } from "@/lib/phone-catalog";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Android parts — Dave's Mobile Shop",
  description: "Samsung Galaxy, Google Pixel and more Android phone parts."
};

const SAMSUNG_GROUPS: Record<string, string[]> = {
  "Galaxy S25": ["galaxy-s25", "galaxy-s25-plus", "galaxy-s25-ultra"],
  "Galaxy S24": ["galaxy-s24", "galaxy-s24-plus", "galaxy-s24-ultra"],
  "Galaxy S23": ["galaxy-s23", "galaxy-s23-plus", "galaxy-s23-ultra"],
  "Galaxy S22": ["galaxy-s22", "galaxy-s22-plus", "galaxy-s22-ultra"],
  "Galaxy S21": ["galaxy-s21", "galaxy-s21-plus", "galaxy-s21-ultra"],
  "Galaxy A series": ["galaxy-a14", "galaxy-a15", "galaxy-a54"],
  "Galaxy Z (foldables)": [
    "galaxy-z-flip-4", "galaxy-z-flip-5", "galaxy-z-flip-6",
    "galaxy-z-fold-4", "galaxy-z-fold-5", "galaxy-z-fold-6"
  ]
};

const PIXEL_GROUPS: Record<string, string[]> = {
  "Pixel 9": ["pixel-9", "pixel-9-pro", "pixel-9-pro-xl"],
  "Pixel 8": ["pixel-8", "pixel-8-pro", "pixel-8a"],
  "Pixel 7": ["pixel-7", "pixel-7-pro", "pixel-7a"],
  "Pixel 6": ["pixel-6", "pixel-6-pro", "pixel-6a"]
};

export default function AndroidModelsPage() {
  const samsung = PHONE_BRANDS.find((b) => b.slug === "samsung")!;
  const google = PHONE_BRANDS.find((b) => b.slug === "google")!;

  function lookup(brand: typeof samsung, slugs: string[]) {
    return slugs.map((s) => brand.models.find((m) => m.slug === s)).filter(Boolean) as typeof brand.models;
  }

  return (
    <div className="container-x py-20">
      <div className="text-center max-w-3xl mx-auto">
        <p className="eyebrow">Android parts</p>
        <h1 className="mt-3 text-display-xl text-white tracking-tighter">
          Pick your Android.
        </h1>
        <p className="mt-5 text-[18px] text-white/65 leading-relaxed">
          Galaxy S, Z Flip, Z Fold, A-series — and every modern Pixel. Pick a model to see what we stock.
        </p>
      </div>

      <div className="mt-16">
        <h2 className="text-display-md text-white tracking-tighter mb-6">Samsung</h2>
        <div className="space-y-10">
          {Object.entries(SAMSUNG_GROUPS).map(([label, slugs], i) => {
            const models = lookup(samsung, slugs);
            if (models.length === 0) return null;
            return (
              <Reveal key={label} delay={i * 50}>
                <section>
                  <h3 className="eyebrow text-white/55 mb-4">{label}</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {models.map((m) => (
                      <Link
                        key={m.slug}
                        href={`/parts/android/${m.slug}`}
                        className="card card-hover p-5 flex flex-col items-center text-center group"
                      >
                        <div className="w-16 h-20 rounded-xl bg-gradient-to-br from-[#2a2a2d] to-[#1d1d1f] flex items-center justify-center text-3xl mb-3 opacity-70 group-hover:opacity-100 transition-opacity">📱</div>
                        <p className="font-semibold text-[15px] text-white tracking-tight">{m.name}</p>
                        <p className="mt-3 link-chevron text-[12px]">See parts</p>
                      </Link>
                    ))}
                  </div>
                </section>
              </Reveal>
            );
          })}
        </div>
      </div>

      <div className="mt-20">
        <h2 className="text-display-md text-white tracking-tighter mb-6">Google Pixel</h2>
        <div className="space-y-10">
          {Object.entries(PIXEL_GROUPS).map(([label, slugs], i) => {
            const models = lookup(google, slugs);
            if (models.length === 0) return null;
            return (
              <Reveal key={label} delay={i * 50}>
                <section>
                  <h3 className="eyebrow text-white/55 mb-4">{label}</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {models.map((m) => (
                      <Link
                        key={m.slug}
                        href={`/parts/android/${m.slug}`}
                        className="card card-hover p-5 flex flex-col items-center text-center group"
                      >
                        <div className="w-16 h-20 rounded-xl bg-gradient-to-br from-[#2a2a2d] to-[#1d1d1f] flex items-center justify-center text-3xl mb-3 opacity-70 group-hover:opacity-100 transition-opacity">📱</div>
                        <p className="font-semibold text-[15px] text-white tracking-tight">{m.name}</p>
                        <p className="mt-3 link-chevron text-[12px]">See parts</p>
                      </Link>
                    ))}
                  </div>
                </section>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
