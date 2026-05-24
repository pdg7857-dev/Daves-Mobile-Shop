import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateTotals, getProvince, isValidPostalCode } from "@/lib/shipping";
import { generateOrderNumber } from "@/lib/orders";
import { getShippingConfig } from "@/lib/settings";
import { applyDiscount } from "@/lib/discounts";
import { DAVE_CARE_PRICES, annualEndsAt, type DaveCarePlanType } from "@/lib/dave-care";
import { syncOrder } from "@/lib/sheets";

type IncomingItem = {
  type: "phone" | "part";
  id: number;
  quantity: number;
  daveCarePlan?: DaveCarePlanType | null;
};

export async function POST(req: Request) {
  const body = await req.json();

  const required = ["customerName", "customerEmail", "addressLine1", "city", "province", "postalCode"];
  for (const k of required) {
    if (!body[k] || String(body[k]).trim() === "") {
      return NextResponse.json({ error: `Missing required field: ${k}` }, { status: 400 });
    }
  }
  const provinceCode = String(body.province).toUpperCase().trim();
  if (!getProvince(provinceCode)) return NextResponse.json({ error: "Invalid province code" }, { status: 400 });
  if (!isValidPostalCode(body.postalCode)) return NextResponse.json({ error: "Invalid Canadian postal code" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail)) return NextResponse.json({ error: "Invalid email address" }, { status: 400 });

  const rawItems: IncomingItem[] = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  const phoneIds = new Set<number>();
  const phonePlans = new Map<number, DaveCarePlanType>();
  const partQuantities = new Map<number, number>();
  for (const item of rawItems) {
    if (item.type === "phone") {
      const id = Number(item.id);
      if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Invalid phone id" }, { status: 400 });
      if (phoneIds.has(id)) continue;
      phoneIds.add(id);
      if (item.daveCarePlan === "monthly" || item.daveCarePlan === "annual") phonePlans.set(id, item.daveCarePlan);
    } else if (item.type === "part") {
      const id = Number(item.id);
      const qty = Number(item.quantity);
      if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Invalid part id" }, { status: 400 });
      if (!Number.isInteger(qty) || qty < 1) return NextResponse.json({ error: "Invalid part quantity" }, { status: 400 });
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
    if (!existing) { orderNumber = candidate; break; }
  }
  if (!orderNumber) return NextResponse.json({ error: "Could not allocate an order number; please retry" }, { status: 503 });

  try {
    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const lineItems: { itemType: string; phoneId?: number; partId?: number; name: string; unitPrice: number; quantity: number; }[] = [];

      const phonePurchases: { phoneId: number; label: string }[] = [];
      for (const id of phoneIds) {
        const phone = await tx.phone.findUnique({ where: { id } });
        if (!phone) throw new Error(`Phone #${id} no longer available`);
        if (phone.askingPrice == null) throw new Error(`${phone.brand} ${phone.model} is not listed for sale`);
        const reserved = await tx.phone.updateMany({ where: { id, status: "for_sale" }, data: { status: "reserved" } });
        if (reserved.count !== 1) throw new Error(`${phone.brand} ${phone.model} is no longer available — someone else may have just ordered it.`);
        const label = `${phone.brand} ${phone.model}${phone.storage ? ` ${phone.storage}` : ""}${phone.color ? ` ${phone.color}` : ""}`;
        subtotal += phone.askingPrice;
        lineItems.push({ itemType: "phone", phoneId: phone.id, name: label, unitPrice: phone.askingPrice, quantity: 1 });
        phonePurchases.push({ phoneId: phone.id, label });

        const plan = phonePlans.get(id);
        if (plan) {
          const planPrice = DAVE_CARE_PRICES[plan];
          subtotal += planPrice;
          lineItems.push({ itemType: "dave-care", phoneId: phone.id, name: `Dave Care (${plan}) — ${label}`, unitPrice: planPrice, quantity: 1 });
        }
      }

      for (const [id, qty] of partQuantities) {
        const part = await tx.part.findUnique({ where: { id } });
        if (!part) throw new Error(`Part #${id} no longer available`);
        const decremented = await tx.part.updateMany({ where: { id, stock: { gte: qty } }, data: { stock: { decrement: qty } } });
        if (decremented.count !== 1) {
          const fresh = await tx.part.findUnique({ where: { id } });
          throw new Error(`Only ${fresh?.stock ?? 0} of "${part.name}" left in stock`);
        }
        subtotal += part.price * qty;
        lineItems.push({ itemType: "part", partId: part.id, name: part.name, unitPrice: part.price, quantity: qty });
      }

      let discountCodeId: number | null = null;
      let discountAmount = 0;
      if (discountCodeInput) {
        const dc = await tx.discountCode.findUnique({ where: { code: discountCodeInput } });
        const application = applyDiscount(dc, subtotal);
        if (!application.ok) throw new Error(`Promo code ${discountCodeInput}: ${application.reason}`);
        const guardWhere = application.discount.maxUses != null ? { id: application.discount.id, usedCount: { lt: application.discount.maxUses } } : { id: application.discount.id };
        const updated = await tx.discountCode.updateMany({ where: guardWhere, data: { usedCount: { increment: 1 } } });
        if (updated.count !== 1) throw new Error(`Promo code ${discountCodeInput}: This code has reached its usage limit`);
        discountCodeId = application.discount.id;
        discountAmount = application.amount;
      }

      const totals = calculateTotals(subtotal, provinceCode, shippingConfig, discountAmount);
      const customerName = String(body.customerName).trim();
      const customerEmail = String(body.customerEmail).trim().toLowerCase();

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerName,
          customerEmail,
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

      const now = new Date();
      for (const purchase of phonePurchases) {
        const plan = phonePlans.get(purchase.phoneId);
        if (!plan) continue;
        await tx.daveCarePlan.create({
          data: {
            orderId: order.id,
            phoneId: purchase.phoneId,
            customerEmail,
            customerName,
            phoneLabel: purchase.label,
            planType: plan,
            pricePaid: DAVE_CARE_PRICES[plan],
            startedAt: now,
            expiresAt: plan === "annual" ? annualEndsAt(now) : null,
            status: "active"
          }
        });
      }

      return order;
    });

    // Push to Sheets (best-effort, ignores failures). Re-read with items
    // for the row summary.
    try {
      const full = await prisma.order.findUnique({
        where: { id: result.id },
        include: { items: { select: { name: true, quantity: true, unitPrice: true, itemType: true } } }
      });
      if (full) await syncOrder(full);
    } catch (err) {
      console.error("Sheets order sync skipped:", err instanceof Error ? err.message : err);
    }

    return NextResponse.json({ orderNumber: result.orderNumber, total: result.total }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to place order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
