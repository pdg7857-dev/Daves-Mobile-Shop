import type { Service } from "@/lib/services";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="card card-hover p-7 flex flex-col h-full">
      <div className="text-4xl mb-1">{service.icon}</div>
      <h3 className="mt-3 font-semibold text-[18px] text-white tracking-tight">{service.name}</h3>
      <p className="mt-1 text-[13px] text-white/55">{service.short}</p>
      <p className="mt-4 text-[14px] text-white/75 leading-relaxed flex-1">{service.description}</p>
      <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between text-[13px]">
        <span className="font-semibold text-white">From {service.startingPrice}</span>
        <span className="text-white/50">{service.turnaround}</span>
      </div>
    </div>
  );
}
