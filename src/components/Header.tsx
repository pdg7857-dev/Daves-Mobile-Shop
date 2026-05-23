import Link from "next/link";
import CartIcon from "./CartIcon";

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/inventory", label: "Phones in Stock" },
  { href: "/parts", label: "Parts" },
  { href: "/anatomy", label: "How iPhones Work" },
  { href: "/locations", label: "Locations" },
  { href: "/orders", label: "Track Order" },
  { href: "/contact", label: "Contact" }
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-gray-950/85 backdrop-blur border-b border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">📱</span>
          <span className="font-bold text-lg bg-gradient-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent">Dave&apos;s Mobile Shop</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <CartIcon />
          <a
            href={`tel:${process.env.NEXT_PUBLIC_BUSINESS_PHONE || ""}`}
            className="btn-primary hidden md:inline-flex ml-2"
          >
            Call us
          </a>
        </div>
      </div>
      <nav className="md:hidden border-t border-gray-800 px-2 flex gap-1 overflow-x-auto">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm font-medium text-gray-300 whitespace-nowrap py-3 px-2 hover:text-white active:bg-gray-800 rounded-md transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
