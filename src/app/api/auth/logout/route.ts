import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE.name);
  const url = new URL(req.url);
  url.pathname = "/admin";
  url.search = "";
  return NextResponse.redirect(url, { status: 303 });
}
