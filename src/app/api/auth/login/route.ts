import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { makeSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get("password") || "");
  const next = String(form.get("next") || "/admin/dashboard");

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: "Server not configured (ADMIN_PASSWORD missing)" }, { status: 500 });
  }
  if (password !== expected) {
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
