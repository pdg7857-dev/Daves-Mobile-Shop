import { NextResponse, type NextRequest } from "next/server";

// Middleware runs on the Edge runtime, which doesn't expose `node:crypto`,
// so the HMAC check here uses the Web Crypto API instead of `src/lib/auth.ts`.
const COOKIE_NAME = "admin_session";

async function verifyEdge(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [issued, sig] = token.split(".");
  if (!issued || !sig) return false;
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const macBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`admin:${issued}`));
  const expected = Array.from(new Uint8Array(macBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  if (expected.length !== sig.length) return false;
  let ok = 0;
  for (let i = 0; i < expected.length; i++) ok |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  if (ok !== 0) return false;
  const age = Date.now() - Number(issued);
  if (!Number.isFinite(age) || age < 0 || age > 1000 * 60 * 60 * 12) return false;
  return true;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Only protect admin app routes — `/admin` itself is the login page (publicly accessible).
  if (!pathname.startsWith("/admin/")) return NextResponse.next();
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const valid = await verifyEdge(token);
  if (!valid) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
