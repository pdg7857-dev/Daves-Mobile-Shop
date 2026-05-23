import Link from "next/link";
import { money } from "@/lib/format";

type Props = {
  phone: {
    id: number;
    brand: string;
    model: string;
    storage: string | null;
    color: string | null;
    condition: string;
    askingPrice: number | null;
    imageUrl: string | null;
    city: string | null;
  };
};

export default function PhoneCard({ phone }: Props) {
  return (
    <Link
      href={`/inventory/${phone.id}`}
      className="card card-hover group flex flex-col"
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-[#2a2a2d] to-[#1d1d1f] flex items-center justify-center overflow-hidden">
        {phone.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={phone.imageUrl}
            alt={`${phone.brand} ${phone.model}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="text-7xl opacity-25">📱</span>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <p className="eyebrow text-white/50">{phone.condition}</p>
        <h3 className="mt-2 font-semibold text-[17px] text-white tracking-tight leading-snug">
          {phone.brand} {phone.model}
        </h3>
        <p className="mt-1 text-[13px] text-white/55">
          {[phone.storage, phone.color].filter(Boolean).join(" · ") || "—"}
        </p>
        <p className="mt-4 text-[20px] font-semibold tracking-tight text-white">
          {money(phone.askingPrice)}
        </p>
      </div>
    </Link>
  );
}
