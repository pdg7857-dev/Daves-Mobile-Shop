import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { DISCOUNT_TYPES } from "@/lib/discounts";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if ("code" in body) data.code = String(body.code).toUpperCase().trim();
  if ("description" in body) data.description = body.description || null;
  if ("discountType" in body) {
    if (!DISCOUNT_TYPES.includes(body.discountType)) {
      return NextResponse.json({ error: "Invalid discount type" }, { status: 400 });
    }
    data.discountType = body.discountType;
  }
  if ("discountValue" in body) {
    const v = Number(body.discountValue);
    if (!Number.isFinite(v) || v <= 0) {
      return NextResponse.json({ error: "Discount value must be positive" }, { status: 400 });
    }
    const type = (body.discountType as string | undefined) ?? (data.discountType as string | undefined);
    if (type === "percentage" && v > 100) {
      return NextResponse.json({ error: "Percentage cannot exceed 100" }, { status: 400 });
    }
    data.discountValue = v;
  }
  if ("minOrderAmount" in body) {
    data.minOrderAmount = body.minOrderAmount == null || body.minOrderAmount === "" ? null : Number(body.minOrderAmount);
  }
  if ("maxUses" in body) {
    data.maxUses = body.maxUses == null || body.maxUses === "" ? null : Number(body.maxUses);
  }
  if ("active" in body) data.active = !!body.active;
  if ("expiresAt" in body) {
    data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  }

  try {
    const updated = await prisma.discountCode.update({ where: { id: Number(id) }, data });
    return NextResponse.json(updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Update failed";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "A code with that name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.discountCode.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
