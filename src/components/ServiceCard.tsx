import type { Service } from "@/lib/services";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="card p-6 flex flex-col h-full">
      <div className="text-3xl">{service.icon}</div>
      <h3 className="mt-3 font-semibold text-lg text-gray-900">{service.name}</h3>
      <p className="mt-1 text-sm text-gray-600">{service.short}</p>
      <p className="mt-3 text-sm text-gray-700 flex-1">{service.description}</p>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="font-semibold text-brand-700">From {service.startingPrice}</span>
        <span className="text-gray-500">{service.turnaround}</span>
      </div>
    </div>
  );
}
