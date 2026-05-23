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
      className="card overflow-hidden hover:border-brand-500 hover:shadow-brand-900/30 transition-all group"
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-6xl">
        {phone.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={phone.imageUrl} alt={`${phone.brand} ${phone.model}`} className="w-full h-full object-cover" />
        ) : (
          <span className="opacity-70">📱</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors">
          {phone.brand} {phone.model}
        </h3>
        <p className="mt-1 text-sm text-gray-400">
          {[phone.storage, phone.color].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-brand-300">{money(phone.askingPrice)}</span>
          <span className="text-xs rounded-full bg-gray-800 border border-gray-700 px-2 py-0.5 text-gray-300">
            {phone.condition}
          </span>
        </div>
      </div>
    </Link>
  );
}
