// Centralized site-URL accessor. Defensively cleans the env var (strips
// angle brackets from accidental markdown autolinks, trailing whitespace,
// and trailing slashes) so a malformed Vercel env var can't crash the build.

function clean(raw: string | undefined): string {
  if (!raw) return "";
  return raw.trim().replace(/^<|>$/g, "").trim().replace(/\/$/, "");
}

/** Returns the canonical site URL as a string, with sensible fallbacks. */
export function getSiteUrl(): string {
  const direct = clean(process.env.NEXT_PUBLIC_SITE_URL);
  if (direct) return direct;
  const vercel = clean(process.env.VERCEL_URL);
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/** Returns the configured site URL as a URL object, or undefined if malformed/unset. */
export function getSiteUrlObject(): URL | undefined {
  const cleaned = clean(process.env.NEXT_PUBLIC_SITE_URL);
  if (!cleaned) return undefined;
  try {
    return new URL(cleaned);
  } catch {
    console.warn(`NEXT_PUBLIC_SITE_URL is not a valid URL: "${process.env.NEXT_PUBLIC_SITE_URL}". Ignoring.`);
    return undefined;
  }
}
