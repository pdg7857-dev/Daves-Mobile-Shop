import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const phone = await prisma.phone.findUnique({
    where: { id: Number(id) },
    include: { supplier: true, repairs: { orderBy: { performedAt: "desc" } } }
  });
  if (!phone) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(phone);
}

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  for (const k of [
    "brand", "model", "storage", "color", "condition", "imei", "serial",
    "status", "purchasedFrom", "notes", "city", "imageUrl", "soldTo"
  ]) {
    if (k in body) data[k] = body[k] === "" ? null : body[k];
  }
  for (const k of ["purchasePrice", "askingPrice", "salePrice", "supplierId"]) {
    if (k in body) data[k] = body[k] === "" || body[k] == null ? null : Number(body[k]);
  }
  for (const k of ["purchaseDate", "soldDate"]) {
    if (k in body) data[k] = body[k] ? new Date(body[k]) : null;
  }

  if (body.status === "sold" && !data.soldDate) {
    data.soldDate = new Date();
  }

  try {
    const phone = await prisma.phone.update({ where: { id: Number(id) }, data });
    return NextResponse.json(phone);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.phone.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
