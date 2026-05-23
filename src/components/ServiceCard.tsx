import type { Service } from "@/lib/services";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="card p-6 flex flex-col h-full hover:border-brand-500 transition-colors">
      <div className="text-3xl">{service.icon}</div>
      <h3 className="mt-3 font-semibold text-lg text-white">{service.name}</h3>
      <p className="mt-1 text-sm text-gray-400">{service.short}</p>
      <p className="mt-3 text-sm text-gray-300 flex-1">{service.description}</p>
      <div className="mt-4 flex items-center justify-between text-sm pt-3 border-t border-gray-800">
        <span className="font-semibold text-brand-300">From {service.startingPrice}</span>
        <span className="text-gray-500">{service.turnaround}</span>
      </div>
    </div>
  );
}
