import Link from "next/link";
import { money } from "@/lib/format";

type Props = {
  part: {
    id: number;
    name: string;
    category: string;
    compatibleWith: string;
    brand: string | null;
    price: number;
    stock: number;
    imageUrl: string | null;
  };
};

export default function PartCard({ part }: Props) {
  const inStock = part.stock > 0;
  return (
    <Link
      href={`/parts/${part.id}`}
      className="card card-hover group flex flex-col"
    >
      <div className="aspect-square bg-gradient-to-br from-[#2a2a2d] to-[#1d1d1f] flex items-center justify-center overflow-hidden">
        {part.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={part.imageUrl}
            alt={part.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="text-6xl opacity-25">🔧</span>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <p className="eyebrow text-white/50">{part.category}</p>
        <h3 className="mt-2 font-semibold text-[15px] text-white tracking-tight leading-snug">{part.name}</h3>
        <p className="mt-1 text-[12px] text-white/55 truncate">{part.compatibleWith}</p>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-[17px] font-semibold tracking-tight text-white">{money(part.price)}</span>
          <span
            className={`text-[11px] font-medium rounded-full px-2.5 py-1 ${
              inStock
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-red-500/15 text-red-300"
            }`}
          >
            {inStock ? `${part.stock} in stock` : "Sold out"}
          </span>
        </div>
      </div>
    </Link>
  );
}
