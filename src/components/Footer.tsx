import Link from "next/link";
import { CITIES } from "@/lib/cities";

export default function Footer() {
  const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || "";
  const email = process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "";
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <h3 className="text-white font-bold text-lg">Dave&apos;s Mobile Shop</h3>
          <p className="mt-2 text-sm">
            Honest repairs and quality refurbished phones across Eastern Canada.
          </p>
          {phone && (
            <p className="mt-3 text-sm">
              <a href={`tel:${phone}`} className="hover:text-white">
                {phone}
              </a>
            </p>
          )}
          {email && (
            <p className="text-sm">
              <a href={`mailto:${email}`} className="hover:text-white">
                {email}
              </a>
            </p>
          )}
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/inventory" className="hover:text-white">Phones in stock</Link></li>
            <li><Link href="/parts" className="hover:text-white">Phone parts</Link></li>
            <li><Link href="/services" className="hover:text-white">Repair services</Link></li>
            <li><Link href="/contact" className="hover:text-white">Get a quote</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm">Locations</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {CITIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/locations/${c.slug}`} className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm">Business</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/admin" className="hover:text-white">Staff login</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-xs text-gray-500">
          © {new Date().getFullYear()} Dave&apos;s Mobile Shop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
