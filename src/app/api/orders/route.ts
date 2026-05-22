import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateTotals, getProvince, isValidPostalCode } from "@/lib/shipping";
import { generateOrderNumber } from "@/lib/orders";

type IncomingItem = { type: "phone" | "part"; id: number; quantity: number };

export async function POST(req: Request) {
  const body = await req.json();

  const required = ["customerName", "customerEmail", "addressLine1", "city", "province", "postalCode"];
  for (const k of required) {
    if (!body[k] || String(body[k]).trim() === "") {
      return NextResponse.json({ error: `Missing required field: ${k}` }, { status: 400 });
    }
  }
  if (!getProvince(body.province)) {
    return NextResponse.json({ error: "Invalid province code" }, { status: 400 });
  }
  if (!isValidPostalCode(body.postalCode)) {
    return NextResponse.json({ error: "Invalid Canadian postal code" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const items: IncomingItem[] = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
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

      // Validate availability + snapshot prices server-side
      for (const item of items) {
        if (item.type === "phone") {
          const phone = await tx.phone.findUnique({ where: { id: item.id } });
          if (!phone) throw new Error(`Phone #${item.id} no longer available`);
          if (phone.status !== "for_sale") {
            throw new Error(`${phone.brand} ${phone.model} is no longer available — someone else may have just ordered it.`);
          }
          if (phone.askingPrice == null) {
            throw new Error(`${phone.brand} ${phone.model} is not listed for sale`);
          }
          subtotal += phone.askingPrice;
          lineItems.push({
            itemType: "phone",
            phoneId: phone.id,
            name: `${phone.brand} ${phone.model}${phone.storage ? ` ${phone.storage}` : ""}${phone.color ? ` ${phone.color}` : ""}`,
            unitPrice: phone.askingPrice,
            quantity: 1
          });
        } else if (item.type === "part") {
          const part = await tx.part.findUnique({ where: { id: item.id } });
          if (!part) throw new Error(`Part #${item.id} no longer available`);
          const qty = Math.max(1, Math.floor(item.quantity || 1));
          if (part.stock < qty) {
            throw new Error(`Only ${part.stock} of "${part.name}" left in stock`);
          }
          subtotal += part.price * qty;
          lineItems.push({
            itemType: "part",
            partId: part.id,
            name: part.name,
            unitPrice: part.price,
            quantity: qty
          });
        } else {
          throw new Error("Unknown item type");
        }
      }

      const totals = calculateTotals(subtotal, body.province);

      // Reserve phones and decrement parts stock
      for (const li of lineItems) {
        if (li.itemType === "phone" && li.phoneId) {
          await tx.phone.update({ where: { id: li.phoneId }, data: { status: "reserved" } });
        } else if (li.itemType === "part" && li.partId) {
          await tx.part.update({
            where: { id: li.partId },
            data: { stock: { decrement: li.quantity } }
          });
        }
      }

      // Create the order with a unique order number (retry on collision)
      let order = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        const orderNumber = generateOrderNumber();
        try {
          order = await tx.order.create({
            data: {
              orderNumber,
              customerName: String(body.customerName).trim(),
              customerEmail: String(body.customerEmail).trim().toLowerCase(),
              customerPhone: body.customerPhone ? String(body.customerPhone).trim() : null,
              addressLine1: String(body.addressLine1).trim(),
              addressLine2: body.addressLine2 ? String(body.addressLine2).trim() : null,
              city: String(body.city).trim(),
              province: String(body.province).toUpperCase(),
              postalCode: String(body.postalCode).toUpperCase().trim(),
              country: "CA",
              customerNotes: body.customerNotes ? String(body.customerNotes).trim() : null,
              status: "pending_payment",
              subtotal: totals.subtotal,
              shippingCost: totals.shippingCost,
              taxAmount: totals.taxAmount,
              total: totals.total,
              items: { create: lineItems }
            }
          });
          break;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "";
          if (!msg.includes("Unique constraint")) throw err;
        }
      }
      if (!order) throw new Error("Could not generate a unique order number");
      return order;
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
