import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { makeSessionToken, SESSION_COOKIE } from "@/lib/auth";

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get("password") || "");
  const next = String(form.get("next") || "/admin/dashboard");

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: "Server not configured (ADMIN_PASSWORD missing)" }, { status: 500 });
  }
  if (!safeEqual(password, expected)) {
    const url = new URL(req.url);
    url.pathname = "/admin";
    url.searchParams.set("error", "1");
    if (next) url.searchParams.set("next", next);
    return NextResponse.redirect(url, { status: 303 });
  }

  const token = makeSessionToken();
  const jar = await cookies();
  jar.set({ ...SESSION_COOKIE, value: token });

  const safeNext = next.startsWith("/admin/") ? next : "/admin/dashboard";
  const url = new URL(req.url);
  url.pathname = safeNext;
  url.search = "";
  return NextResponse.redirect(url, { status: 303 });
}
