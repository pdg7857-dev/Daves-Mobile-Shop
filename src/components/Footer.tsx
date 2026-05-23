import Link from "next/link";
import { CITIES } from "@/lib/cities";

export default function Footer() {
  const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || "";
  const email = process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "";
  return (
    <footer className="bg-[#1d1d1f] text-white/80 mt-24 border-t border-white/[0.06]">
      <div className="container-x py-12">
        <p className="text-[12px] leading-relaxed text-white/55 max-w-3xl">
          More ways to shop: <Link href="/inventory" className="text-white hover:underline">Find a phone</Link> near you.
          Or call <a href={`tel:${phone}`} className="text-white hover:underline">{phone || "us"}</a>.
        </p>

        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 text-[12px]">
          <div>
            <h4 className="text-white text-[12px] font-semibold mb-3">Shop & repair</h4>
            <ul className="space-y-2 text-white/60">
              <li><Link href="/inventory" className="hover:text-white">Phones in stock</Link></li>
              <li><Link href="/parts" className="hover:text-white">Parts</Link></li>
              <li><Link href="/services" className="hover:text-white">Repair services</Link></li>
              <li><Link href="/contact" className="hover:text-white">Get a quote</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-[12px] font-semibold mb-3">Locations</h4>
            <ul className="space-y-2 text-white/60">
              {CITIES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/locations/${c.slug}`} className="hover:text-white">{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white text-[12px] font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-white/60">
              <li><Link href="/orders" className="hover:text-white">Track an order</Link></li>
              <li><Link href="/admin" className="hover:text-white">Staff login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-[12px] font-semibold mb-3">Get in touch</h4>
            <ul className="space-y-2 text-white/60">
              {phone && <li><a href={`tel:${phone}`} className="hover:text-white">{phone}</a></li>}
              {email && <li><a href={`mailto:${email}`} className="hover:text-white">{email}</a></li>}
              <li><Link href="/contact" className="hover:text-white">Contact support</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between gap-3 text-[12px] text-white/45">
          <p>Copyright © {new Date().getFullYear()} Dave&rsquo;s Mobile Shop. All rights reserved.</p>
          <p>Honest repairs across Eastern Canada.</p>
        </div>
      </div>
    </footer>
  );
}
