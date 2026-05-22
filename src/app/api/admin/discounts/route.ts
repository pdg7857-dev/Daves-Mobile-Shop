import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { DISCOUNT_TYPES } from "@/lib/discounts";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const codes = await prisma.discountCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(codes);
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const code = String(body.code || "").toUpperCase().trim();
  if (!code) return NextResponse.json({ error: "Code is required" }, { status: 400 });
  if (!DISCOUNT_TYPES.includes(body.discountType)) {
    return NextResponse.json({ error: "Invalid discount type" }, { status: 400 });
  }
  const value = Number(body.discountValue);
  if (!Number.isFinite(value) || value <= 0) {
    return NextResponse.json({ error: "Discount value must be positive" }, { status: 400 });
  }
  if (body.discountType === "percentage" && value > 100) {
    return NextResponse.json({ error: "Percentage cannot exceed 100" }, { status: 400 });
  }

  try {
    const created = await prisma.discountCode.create({
      data: {
        code,
        description: body.description || null,
        discountType: body.discountType,
        discountValue: value,
        minOrderAmount: body.minOrderAmount != null && body.minOrderAmount !== "" ? Number(body.minOrderAmount) : null,
        maxUses: body.maxUses != null && body.maxUses !== "" ? Number(body.maxUses) : null,
        active: body.active !== false,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null
      }
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "A code with that name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
