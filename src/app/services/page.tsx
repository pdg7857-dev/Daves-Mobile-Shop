import { SERVICES } from "@/lib/services";
import ServiceCard from "@/components/ServiceCard";

export const metadata = {
  title: "Repair Services — Dave's Mobile Shop",
  description:
    "Full-service mobile phone repair: screen, battery, camera, housing, charging port, water damage, speakers, and more."
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900">Repair services</h1>
        <p className="mt-3 text-gray-600">
          Fixed-price quotes, OEM parts where possible, and a 90-day workmanship warranty on every repair.
          Walk in or book ahead — most jobs done same day.
        </p>
      </header>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICES.map((s) => (
          <ServiceCard key={s.slug} service={s} />
        ))}
      </div>
      <div className="mt-12 card p-6 bg-brand-50 border-brand-100">
        <h2 className="text-xl font-semibold text-brand-900">Don&apos;t see your device or repair?</h2>
        <p className="mt-2 text-sm text-brand-800">
          We service nearly every smartphone brand and many tablets. If it&apos;s not listed, just ask.
        </p>
      </div>
    </div>
  );
}
