import { NextResponse, type NextRequest } from "next/server";

// Middleware runs on the Edge runtime, which doesn't expose `node:crypto`,
// so the HMAC check here uses the Web Crypto API instead of `src/lib/auth.ts`.

const ADMIN_COOKIE = "admin_session";
const VISITOR_COOKIE = "dms_vid";
const VISITOR_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

async function verifyAdminSession(token: string | undefined): Promise<boolean> {
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

function randomId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ---- Admin gate ----
  if (pathname.startsWith("/admin/")) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    const valid = await verifyAdminSession(token);
    if (!valid) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ---- Analytics: stamp a visitor cookie + forward geo headers ----
  // Don't track admin / api requests; let everything else through.
  if (pathname.startsWith("/api/") || pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  if (!req.cookies.get(VISITOR_COOKIE)) {
    res.cookies.set(VISITOR_COOKIE, randomId(), {
      maxAge: VISITOR_MAX_AGE,
      httpOnly: false, // client-side tracker reads this
      sameSite: "lax",
      path: "/"
    });
  }
  return res;
}

export const config = {
  // Match every page (HTML) but skip Next internals, static files, etc.
  matcher: ["/((?!_next/|favicon|robots.txt|sitemap.xml|images/|icons/|.*\\..*).*)"]
};
