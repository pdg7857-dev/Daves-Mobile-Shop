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
      className="card overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
    >
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-5xl">
        {part.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={part.imageUrl} alt={part.name} className="w-full h-full object-cover" />
        ) : (
          <span>🔧</span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          {part.category}
        </span>
        <h3 className="mt-1 font-semibold text-sm text-gray-900 group-hover:text-brand-700">
          {part.name}
        </h3>
        <p className="mt-1 text-xs text-gray-600">{part.compatibleWith}</p>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="font-bold text-brand-700">{money(part.price)}</span>
          <span className={`text-xs rounded-full px-2 py-0.5 ${inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {inStock ? `${part.stock} in stock` : "Out of stock"}
          </span>
        </div>
      </div>
    </Link>
  );
}
