import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { applyDiscount } from "@/lib/discounts";

export async function POST(req: Request) {
  const body = await req.json();
  const codeRaw = String(body.code || "").toUpperCase().trim();
  const subtotal = Number(body.subtotal);
  if (!codeRaw) return NextResponse.json({ ok: false, reason: "Code is required" });
  if (!Number.isFinite(subtotal) || subtotal < 0) {
    return NextResponse.json({ ok: false, reason: "Invalid subtotal" });
  }

  const code = await prisma.discountCode.findUnique({ where: { code: codeRaw } });
  const result = applyDiscount(code, subtotal);
  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason });
  }
  return NextResponse.json({
    ok: true,
    code: result.discount.code,
    discountType: result.discount.discountType,
    discountValue: result.discount.discountValue,
    discountAmount: result.amount
  });
}
