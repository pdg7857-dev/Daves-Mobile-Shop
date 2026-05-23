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
      className="card overflow-hidden hover:border-brand-500 transition-colors group flex flex-col"
    >
      <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-5xl">
        {part.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={part.imageUrl} alt={part.name} className="w-full h-full object-cover" />
        ) : (
          <span className="opacity-70">🔧</span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-400">
          {part.category}
        </span>
        <h3 className="mt-1 font-semibold text-sm text-white group-hover:text-brand-300 transition-colors">
          {part.name}
        </h3>
        <p className="mt-1 text-xs text-gray-400">{part.compatibleWith}</p>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="font-bold text-brand-300">{money(part.price)}</span>
          <span className={`text-xs rounded-full px-2 py-0.5 border ${inStock ? "bg-green-900/40 text-green-300 border-green-700/50" : "bg-red-900/40 text-red-300 border-red-700/50"}`}>
            {inStock ? `${part.stock} in stock` : "Out of stock"}
          </span>
        </div>
      </div>
    </Link>
  );
}
