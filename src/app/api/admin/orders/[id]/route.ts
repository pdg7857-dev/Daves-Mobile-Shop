import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders";

type Ctx = { params: Promise<{ id: string }> };

async function runRestore(tx: Prisma.TransactionClient, orderId: number) {
  const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return;
  for (const item of order.items) {
    if (item.itemType === "phone" && item.phoneId) {
      await tx.phone.update({ where: { id: item.phoneId }, data: { status: "for_sale", soldDate: null, salePrice: null, soldTo: null } });
    } else if (item.itemType === "part" && item.partId) {
      await tx.part.update({ where: { id: item.partId }, data: { stock: { increment: item.quantity } } });
    }
  }
  if (order.discountCodeId) {
    await tx.discountCode.update({ where: { id: order.discountCodeId }, data: { usedCount: { decrement: 1 } } });
  }
  await tx.daveCarePlan.updateMany({ where: { orderId, status: "active" }, data: { status: "cancelled" } });
}

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const orderId = Number(id);
  const body = await req.json();
  const newStatus = body.status as OrderStatus | undefined;
  if (newStatus && !ORDER_STATUSES.includes(newStatus)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
      if (!existing) throw new Error("Order not found");
      const prevStatus = existing.status as OrderStatus;

      const data: Record<string, unknown> = {};
      const now = new Date();

      if (newStatus && newStatus !== prevStatus) {
        const swap = await tx.order.updateMany({ where: { id: orderId, status: prevStatus }, data: { status: newStatus } });
        if (swap.count !== 1) throw new Error("Order was just updated by someone else. Refresh and try again.");

        if (newStatus === "paid" && !existing.paidAt) data.paidAt = now;
        if (newStatus === "shipped" && !existing.shippedAt) data.shippedAt = now;
        if (newStatus === "delivered" && !existing.deliveredAt) data.deliveredAt = now;
        if ((newStatus === "cancelled" || newStatus === "refunded") && !existing.cancelledAt) data.cancelledAt = now;

        if (newStatus === "shipped" || newStatus === "delivered") {
          const soldAt = existing.shippedAt ?? now;
          for (const item of existing.items) {
            if (item.itemType === "phone" && item.phoneId) {
              const exists = await tx.phone.findUnique({ where: { id: item.phoneId }, select: { id: true } });
              if (exists) {
                await tx.phone.update({ where: { id: item.phoneId }, data: { status: "sold", soldDate: soldAt, salePrice: item.unitPrice, soldTo: existing.customerName } });
              }
            }
          }
        }
        if (newStatus === "cancelled" || newStatus === "refunded") {
          const alreadyFulfilled = prevStatus === "shipped" || prevStatus === "delivered";
          if (!alreadyFulfilled) {
            for (const item of existing.items) {
              if (item.itemType === "phone" && item.phoneId) {
                const exists = await tx.phone.findUnique({ where: { id: item.phoneId }, select: { id: true } });
                if (exists) await tx.phone.update({ where: { id: item.phoneId }, data: { status: "for_sale", soldDate: null, salePrice: null, soldTo: null } });
              } else if (item.itemType === "part" && item.partId) {
                const exists = await tx.part.findUnique({ where: { id: item.partId }, select: { id: true } });
                if (exists) await tx.part.update({ where: { id: item.partId }, data: { stock: { increment: item.quantity } } });
              }
            }
            if (existing.discountCodeId) {
              await tx.discountCode.update({ where: { id: existing.discountCodeId }, data: { usedCount: { decrement: 1 } } });
            }
            await tx.daveCarePlan.updateMany({ where: { orderId, status: "active" }, data: { status: "cancelled" } });
          }
        }
      }

      if ("trackingNumber" in body) data.trackingNumber = body.trackingNumber || null;
      if ("carrier" in body) data.carrier = body.carrier || null;
      if ("adminNotes" in body) data.adminNotes = body.adminNotes || null;
      if ("paymentMethod" in body) data.paymentMethod = body.paymentMethod || null;

      if (Object.keys(data).length === 0) {
        if (newStatus && newStatus !== prevStatus) {
          const fresh = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
          return fresh ?? existing;
        }
        return existing;
      }
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
  const orderId = Number(id);
  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, select: { status: true } });
      if (!order) throw new Error("Order not found");
      if (order.status !== "shipped" && order.status !== "delivered") await runRestore(tx, orderId);
      await tx.order.delete({ where: { id: orderId } });
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
