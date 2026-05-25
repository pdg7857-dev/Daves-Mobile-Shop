"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/parts", label: "Parts" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/sms", label: "SMS" },
  { href: "/admin/dave-care", label: "Dave Care" },
  { href: "/admin/discounts", label: "Discounts" },
  { href: "/admin/suppliers", label: "Suppliers" },
  { href: "/admin/settings", label: "Settings" }
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
            return (
              <Link key={tab.href} href={tab.href} className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${active ? "border-brand-600 text-brand-700" : "border-transparent text-gray-600 hover:text-gray-900"}`}>{tab.label}</Link>
            );
          })}
        </div>
        <form action="/api/auth/logout" method="POST">
          <button className="text-sm text-gray-600 hover:text-gray-900" type="submit">Sign out</button>
        </form>
      </div>
    </div>
  );
}
