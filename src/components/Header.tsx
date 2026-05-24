import Link from "next/link";
import CartIcon from "./CartIcon";

const NAV: Array<{ href: string; label: string; dropdown?: Array<{ href: string; label: string; hint: string }> }> = [
  { href: "/inventory", label: "Shop" },
  { href: "/services", label: "Repair Services" },
  {
    href: "/parts",
    label: "Parts",
    dropdown: [
      { href: "/anatomy", label: "How to fix your phone", hint: "Step-by-step iPhone repair guides" },
      { href: "/parts/apple", label: "Apple parts", hint: "Screens, batteries and more for every iPhone" },
      { href: "/parts/android", label: "Android parts", hint: "Samsung Galaxy, Pixel and more" },
      { href: "/parts/tools", label: "Tools & Equipment", hint: "Everything a tech needs" }
    ]
  },
  {
    href: "/orders",
    label: "Tracking & Support",
    dropdown: [
      { href: "/orders", label: "Track an order", hint: "Look up an order by order number" },
      { href: "/contact", label: "Contact us", hint: "Phone, email and chat" },
      { href: "/blog", label: "Blog", hint: "Repair guides and announcements" },
      { href: "/locations", label: "Service areas", hint: "Where we ship" }
    ]
  }
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 glass">
      <div className="mx-auto max-w-[1024px] px-6 sm:px-8 flex h-12 items-center justify-between">
        <Link href="/" className="text-[15px] font-medium tracking-tight text-white/90 hover:text-white transition-colors">
          Dave&rsquo;s Mobile
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((item) =>
            item.dropdown ? (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className="text-[12px] font-normal text-white/80 hover:text-white transition-colors tracking-tight flex items-center gap-1"
                >
                  {item.label}
                </Link>
                {/* Apple-style dropdown panel */}
                <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-40">
                  <div className="w-72 rounded-2xl border border-white/10 bg-[#1d1d1f]/95 backdrop-blur-xl shadow-2xl shadow-black/60 p-2">
                    {item.dropdown.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className="block px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-colors"
                      >
                        <div className="text-[14px] font-medium text-white tracking-tight">{sub.label}</div>
                        <div className="text-[12px] text-white/55 mt-0.5">{sub.hint}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-[12px] font-normal text-white/80 hover:text-white transition-colors tracking-tight"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
        <div className="flex items-center gap-3">
          <CartIcon />
        </div>
      </div>
      {/* Mobile — flat list, no dropdown; sub-items live on the /parts hub page */}
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
