import { SERVICES } from "@/lib/services";
import ServiceCard from "@/components/ServiceCard";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Repair Services — Dave's Mobile Shop",
  description:
    "Full-service mobile phone repair: screen, battery, camera, housing, charging port, water damage, speakers, and more."
};

export default function ServicesPage() {
  return (
    <div className="container-x py-20">
      <header className="text-center max-w-3xl mx-auto">
        <p className="eyebrow">Repair services</p>
        <h1 className="mt-3 text-display-xl text-white tracking-tighter">
          Every fix, fairly priced.
        </h1>
        <p className="mt-5 text-[18px] text-white/65 leading-relaxed">
          Fixed-price quotes. OEM parts where possible. A 90-day workmanship
          warranty on every repair. Walk in or book ahead — most jobs done same day.
        </p>
      </header>

      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SERVICES.map((s, i) => (
          <Reveal key={s.slug} delay={(i % 3) * 80}>
            <ServiceCard service={s} />
          </Reveal>
        ))}
      </div>

      <div className="mt-12 card p-10 text-center max-w-2xl mx-auto">
        <p className="eyebrow">Not on this list?</p>
        <h2 className="mt-2 text-2xl font-semibold text-white tracking-tight">
          We service nearly every smartphone.
        </h2>
        <p className="mt-3 text-[15px] text-white/65">
          Tablets and smartwatches too. If it&rsquo;s not listed, just ask — we&rsquo;ll quote it.
        </p>
      </div>
    </div>
  );
}
