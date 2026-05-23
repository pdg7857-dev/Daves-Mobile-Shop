import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

const STATUSES = new Set(["active", "expired", "cancelled"]);
const CLAIM_FIELDS = ["batteryUsed", "cameraUsed", "screenUsed", "backGlassUsed"] as const;

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if ("status" in body) {
    if (!STATUSES.has(body.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    data.status = body.status;
  }
  if ("notes" in body) data.notes = body.notes || null;
  for (const f of CLAIM_FIELDS) {
    if (f in body) data[f] = !!body[f];
  }

  try {
    const updated = await prisma.daveCarePlan.update({ where: { id: Number(id) }, data });
    return NextResponse.json(updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.daveCarePlan.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
