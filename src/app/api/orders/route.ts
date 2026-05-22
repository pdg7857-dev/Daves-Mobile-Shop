import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateTotals, getProvince, isValidPostalCode } from "@/lib/shipping";
import { generateOrderNumber } from "@/lib/orders";
import { getShippingConfig } from "@/lib/settings";
import { applyDiscount } from "@/lib/discounts";

type IncomingItem = { type: "phone" | "part"; id: number; quantity: number };

export async function POST(req: Request) {
  const body = await req.json();

  const required = ["customerName", "customerEmail", "addressLine1", "city", "province", "postalCode"];
  for (const k of required) {
    if (!body[k] || String(body[k]).trim() === "") {
      return NextResponse.json({ error: `Missing required field: ${k}` }, { status: 400 });
    }
  }
  const provinceCode = String(body.province).toUpperCase().trim();
  if (!getProvince(provinceCode)) {
    return NextResponse.json({ error: "Invalid province code" }, { status: 400 });
  }
  if (!isValidPostalCode(body.postalCode)) {
    return NextResponse.json({ error: "Invalid Canadian postal code" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const rawItems: IncomingItem[] = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const phoneIds = new Set<number>();
  const partQuantities = new Map<number, number>();
  for (const item of rawItems) {
    if (item.type === "phone") {
      const id = Number(item.id);
      if (!Number.isInteger(id) || id <= 0) {
        return NextResponse.json({ error: "Invalid phone id" }, { status: 400 });
      }
      if (phoneIds.has(id)) continue;
      phoneIds.add(id);
    } else if (item.type === "part") {
      const id = Number(item.id);
      const qty = Number(item.quantity);
      if (!Number.isInteger(id) || id <= 0) {
        return NextResponse.json({ error: "Invalid part id" }, { status: 400 });
      }
      if (!Number.isInteger(qty) || qty < 1) {
        return NextResponse.json({ error: "Invalid part quantity" }, { status: 400 });
      }
      partQuantities.set(id, (partQuantities.get(id) ?? 0) + qty);
    } else {
      return NextResponse.json({ error: "Unknown item type" }, { status: 400 });
    }
  }

  const shippingConfig = await getShippingConfig();
  const discountCodeInput = body.discountCode ? String(body.discountCode).toUpperCase().trim() : null;

  let orderNumber = "";
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = generateOrderNumber();
    const existing = await prisma.order.findUnique({ where: { orderNumber: candidate }, select: { id: true } });
    if (!existing) {
      orderNumber = candidate;
      break;
    }
  }
  if (!orderNumber) {
    return NextResponse.json({ error: "Could not allocate an order number; please retry" }, { status: 503 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const lineItems: {
        itemType: "phone" | "part";
        phoneId?: number;
        partId?: number;
        name: string;
        unitPrice: number;
        quantity: number;
      }[] = [];

      for (const id of phoneIds) {
        const phone = await tx.phone.findUnique({ where: { id } });
        if (!phone) throw new Error(`Phone #${id} no longer available`);
        if (phone.askingPrice == null) {
          throw new Error(`${phone.brand} ${phone.model} is not listed for sale`);
        }
        const reserved = await tx.phone.updateMany({
          where: { id, status: "for_sale" },
          data: { status: "reserved" }
        });
        if (reserved.count !== 1) {
          throw new Error(`${phone.brand} ${phone.model} is no longer available — someone else may have just ordered it.`);
        }
        subtotal += phone.askingPrice;
        lineItems.push({
          itemType: "phone",
          phoneId: phone.id,
          name: `${phone.brand} ${phone.model}${phone.storage ? ` ${phone.storage}` : ""}${phone.color ? ` ${phone.color}` : ""}`,
          unitPrice: phone.askingPrice,
          quantity: 1
        });
      }

      for (const [id, qty] of partQuantities) {
        const part = await tx.part.findUnique({ where: { id } });
        if (!part) throw new Error(`Part #${id} no longer available`);
        const decremented = await tx.part.updateMany({
          where: { id, stock: { gte: qty } },
          data: { stock: { decrement: qty } }
        });
        if (decremented.count !== 1) {
          const fresh = await tx.part.findUnique({ where: { id } });
          throw new Error(`Only ${fresh?.stock ?? 0} of "${part.name}" left in stock`);
        }
        subtotal += part.price * qty;
        lineItems.push({
          itemType: "part",
          partId: part.id,
          name: part.name,
          unitPrice: part.price,
          quantity: qty
        });
      }

      let discountCodeId: number | null = null;
      let discountAmount = 0;
      if (discountCodeInput) {
        const dc = await tx.discountCode.findUnique({ where: { code: discountCodeInput } });
        const application = applyDiscount(dc, subtotal);
        if (!application.ok) {
          throw new Error(`Promo code ${discountCodeInput}: ${application.reason}`);
        }
        const guardWhere =
          application.discount.maxUses != null
            ? { id: application.discount.id, usedCount: { lt: application.discount.maxUses } }
            : { id: application.discount.id };
        const updated = await tx.discountCode.updateMany({
          where: guardWhere,
          data: { usedCount: { increment: 1 } }
        });
        if (updated.count !== 1) {
          throw new Error(`Promo code ${discountCodeInput}: This code has reached its usage limit`);
        }
        discountCodeId = application.discount.id;
        discountAmount = application.amount;
      }

      const totals = calculateTotals(subtotal, provinceCode, shippingConfig, discountAmount);

      return tx.order.create({
        data: {
          orderNumber,
          customerName: String(body.customerName).trim(),
          customerEmail: String(body.customerEmail).trim().toLowerCase(),
          customerPhone: body.customerPhone ? String(body.customerPhone).trim() : null,
          addressLine1: String(body.addressLine1).trim(),
          addressLine2: body.addressLine2 ? String(body.addressLine2).trim() : null,
          city: String(body.city).trim(),
          province: provinceCode,
          postalCode: String(body.postalCode).toUpperCase().trim(),
          country: "CA",
          customerNotes: body.customerNotes ? String(body.customerNotes).trim() : null,
          status: "pending_payment",
          subtotal: totals.subtotal,
          discountCodeId,
          discountAmount: totals.discountAmount,
          shippingCost: totals.shippingCost,
          taxAmount: totals.taxAmount,
          total: totals.total,
          items: { create: lineItems }
        }
      });
    });

    return NextResponse.json(
      { orderNumber: result.orderNumber, total: result.total },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to place order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
