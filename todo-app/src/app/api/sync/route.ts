import { NextResponse } from "next/server";
import { syncAll } from "@/lib/sync";

// POST /api/sync — runs both source syncs + spawns due recurring tasks.
// Trigger from the UI ("Sync now") or from any external scheduler.
export async function POST() {
  const report = await syncAll();
  const status = report.mobileShop.ok && report.toyota.ok ? 200 : 207;
  return NextResponse.json(report, { status });
}
