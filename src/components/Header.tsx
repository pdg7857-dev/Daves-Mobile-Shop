import Link from "next/link";
import CartIcon from "./CartIcon";

const NAV = [
  { href: "/services", label: "Repair" },
  { href: "/inventory", label: "Shop" },
  { href: "/parts", label: "Parts" },
  { href: "/anatomy", label: "How it works" },
  { href: "/locations", label: "Locations" },
  { href: "/orders", label: "Track" },
  { href: "/contact", label: "Support" }
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 glass">
      <div className="mx-auto max-w-[1024px] px-6 sm:px-8 flex h-12 items-center justify-between">
        <Link href="/" className="text-[15px] font-medium tracking-tight text-white/90 hover:text-white transition-colors">
          Dave&rsquo;s Mobile
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[12px] font-normal text-white/80 hover:text-white transition-colors tracking-tight"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <CartIcon />
        </div>
      </div>
      {/* Mobile sub-nav — Apple uses an off-canvas menu, but a horizontal scroll keeps it lightweight */}
      <nav className="md:hidden border-t border-white/[0.06] px-3 flex gap-1 overflow-x-auto">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-[13px] font-normal text-white/80 whitespace-nowrap py-3 px-3 hover:text-white tracking-tight"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
