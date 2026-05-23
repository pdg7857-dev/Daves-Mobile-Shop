import { NextResponse } from "next/server";
import { syncAll } from "@/lib/sync";

// GET /api/cron — meant for Vercel Cron / external schedulers. Requires a
// shared CRON_SECRET as a bearer token (Vercel sends this header automatically
// when CRON_SECRET is configured).
export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const report = await syncAll();
  return NextResponse.json(report);
}
