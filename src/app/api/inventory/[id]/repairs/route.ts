import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { syncPhone } from "@/lib/sheets";

type Ctx = { params: Promise<{ id: string }> };

async function syncAfterRepairChange(phoneId: number) {
  const full = await prisma.phone.findUnique({
    where: { id: phoneId },
    include: { supplier: true, repairs: true }
  });
  if (full) await syncPhone(full);
}

export async function POST(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  if (!body.serviceType) return NextResponse.json({ error: "serviceType required" }, { status: 400 });

  const repair = await prisma.repair.create({
    data: {
      phoneId: Number(id),
      serviceType: String(body.serviceType),
      description: body.description ? String(body.description) : null,
      partCost: body.partCost ? Number(body.partCost) : null,
      laborCost: body.laborCost ? Number(body.laborCost) : null,
      performedBy: body.performedBy ? String(body.performedBy) : null,
      performedAt: body.performedAt ? new Date(body.performedAt) : new Date()
    }
  });
  await syncAfterRepairChange(Number(id));
  return NextResponse.json(repair, { status: 201 });
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const url = new URL(req.url);
  const repairId = url.searchParams.get("repairId");
  if (!repairId) return NextResponse.json({ error: "repairId required" }, { status: 400 });
  await prisma.repair.delete({ where: { id: Number(repairId) } });
  await syncAfterRepairChange(Number(id));
  return NextResponse.json({ ok: true });
}
