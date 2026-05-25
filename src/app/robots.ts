import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/orders/"] // order URLs are private (require email)
      }
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`
  };
}
