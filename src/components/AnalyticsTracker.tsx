"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics-client";

// Fires a page view on initial load + on every client-side route change.
// Skips admin/api paths since middleware excludes them anyway.
export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
