import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const orderId = Number(id);
  const body = await req.json();
  const newStatus = body.status as OrderStatus | undefined;
  if (newStatus && !ORDER_STATUSES.includes(newStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });
      if (!existing) throw new Error("Order not found");
      const prevStatus = existing.status as OrderStatus;

      // Side effects when transitioning to specific statuses
      if (newStatus && newStatus !== prevStatus) {
        if (newStatus === "shipped" || newStatus === "delivered") {
          // Phones go from reserved → sold (record sale metadata)
          for (const item of existing.items) {
            if (item.itemType === "phone" && item.phoneId) {
              await tx.phone.update({
                where: { id: item.phoneId },
                data: {
                  status: "sold",
                  soldDate: existing.shippedAt ?? new Date(),
                  salePrice: item.unitPrice,
                  soldTo: existing.customerName
                }
              });
            }
          }
        }
        if (newStatus === "cancelled" || newStatus === "refunded") {
          // Restore phones to for_sale and replenish part stock — but only if we
          // hadn't already shipped (avoid restoring something that physically left).
          const alreadyFulfilled = prevStatus === "shipped" || prevStatus === "delivered";
          if (!alreadyFulfilled) {
            for (const item of existing.items) {
              if (item.itemType === "phone" && item.phoneId) {
                await tx.phone.update({
                  where: { id: item.phoneId },
                  data: { status: "for_sale", soldDate: null, salePrice: null, soldTo: null }
                });
              } else if (item.itemType === "part" && item.partId) {
                await tx.part.update({
                  where: { id: item.partId },
                  data: { stock: { increment: item.quantity } }
                });
              }
            }
          }
        }
      }

      const data: Record<string, unknown> = {};
      if (newStatus) {
        data.status = newStatus;
        if (newStatus === "paid" && !existing.paidAt) data.paidAt = new Date();
        if (newStatus === "shipped" && !existing.shippedAt) data.shippedAt = new Date();
        if (newStatus === "delivered" && !existing.deliveredAt) data.deliveredAt = new Date();
        if ((newStatus === "cancelled" || newStatus === "refunded") && !existing.cancelledAt) {
          data.cancelledAt = new Date();
        }
      }
      if ("trackingNumber" in body) data.trackingNumber = body.trackingNumber || null;
      if ("carrier" in body) data.carrier = body.carrier || null;
      if ("adminNotes" in body) data.adminNotes = body.adminNotes || null;
      if ("paymentMethod" in body) data.paymentMethod = body.paymentMethod || null;

      return tx.order.update({ where: { id: orderId }, data });
    });

    return NextResponse.json(updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.order.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
