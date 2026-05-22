import Link from "next/link";

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/inventory", label: "Phones in Stock" },
  { href: "/parts", label: "Parts" },
  { href: "/locations", label: "Locations" },
  { href: "/contact", label: "Contact" }
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">📱</span>
          <span className="font-bold text-lg text-brand-700">Dave&apos;s Mobile Shop</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-700 hover:text-brand-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <a
          href={`tel:${process.env.NEXT_PUBLIC_BUSINESS_PHONE || ""}`}
          className="btn-primary hidden md:inline-flex"
        >
          Call us
        </a>
      </div>
      <nav className="md:hidden border-t border-gray-100 px-4 py-2 flex gap-4 overflow-x-auto">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm font-medium text-gray-700 whitespace-nowrap"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
