import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

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
  return NextResponse.json(repair, { status: 201 });
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const repairId = url.searchParams.get("repairId");
  if (!repairId) return NextResponse.json({ error: "repairId required" }, { status: 400 });
  await prisma.repair.delete({ where: { id: Number(repairId) } });
  return NextResponse.json({ ok: true });
}
