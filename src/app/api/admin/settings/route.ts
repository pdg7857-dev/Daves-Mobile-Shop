import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if ("shippingFlatRate" in body) {
    const v = Number(body.shippingFlatRate);
    if (!Number.isFinite(v) || v < 0) return NextResponse.json({ error: "Invalid shipping rate" }, { status: 400 });
    data.shippingFlatRate = v;
  }
  if ("freeShippingThreshold" in body) {
    if (body.freeShippingThreshold == null) {
      data.freeShippingThreshold = null;
    } else {
      const v = Number(body.freeShippingThreshold);
      if (!Number.isFinite(v) || v < 0) return NextResponse.json({ error: "Invalid threshold" }, { status: 400 });
      data.freeShippingThreshold = v;
    }
  }

  await getSettings();
  const updated = await prisma.settings.update({ where: { id: 1 }, data });
  return NextResponse.json(updated);
}
