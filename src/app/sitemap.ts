import type { MetadataRoute } from "next";
import { CITIES } from "@/lib/cities";
import { ANATOMY_MODELS } from "@/lib/iphone-anatomy";

function baseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = baseUrl();
  const now = new Date();

  const staticPaths = [
    "", "/services", "/inventory", "/parts", "/locations", "/contact", "/anatomy", "/orders"
  ];

  return [
    ...staticPaths.map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: (path === "" || path === "/inventory" || path === "/parts" ? "daily" : "weekly") as MetadataRoute.Sitemap[number]["changeFrequency"],
      priority: path === "" ? 1.0 : 0.7
    })),
    ...CITIES.map((c) => ({
      url: `${base}/locations/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8
    })),
    ...ANATOMY_MODELS.map((m) => ({
      url: `${base}/anatomy/${m.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6
    }))
  ];
}
