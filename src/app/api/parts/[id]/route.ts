import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  for (const k of ["name", "category", "compatibleWith", "brand", "imageUrl", "description"]) {
    if (k in body) data[k] = body[k] === "" ? null : body[k];
  }
  for (const k of ["price", "stock"]) {
    if (k in body) data[k] = Number(body[k]);
  }

  const part = await prisma.part.update({ where: { id: Number(id) }, data });
  return NextResponse.json(part);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.part.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
