import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const reviewId = Number(id);
  const body = await req.json();
  const status = body.status as string;
  if (!["approved", "hidden", "flagged"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  await prisma.review.update({ where: { id: reviewId }, data: { status } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.review.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
