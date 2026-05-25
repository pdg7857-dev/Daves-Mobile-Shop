import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { sendSms } from "@/lib/sms";
import { randomBytes } from "node:crypto";

export const maxDuration = 60; // give the function up to 60s for larger broadcasts

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { body } = await req.json();
  const text = String(body || "").trim();
  if (text.length < 10) return NextResponse.json({ error: "Message too short" }, { status: 400 });
  if (text.length > 320) return NextResponse.json({ error: "Message too long (max 320)" }, { status: 400 });

  // Find distinct opted-in phone numbers
  const orders = await prisma.order.findMany({
    where: {
      smsOptIn: true,
      customerPhone: { not: null },
      marketingUnsubscribedAt: null
    },
    select: { id: true, customerPhone: true },
    orderBy: { createdAt: "desc" }
  });

  // Dedupe by phone (one customer may have multiple orders)
  const seen = new Set<string>();
  const recipients: Array<{ orderId: number; phone: string }> = [];
  for (const o of orders) {
    if (!o.customerPhone) continue;
    const key = o.customerPhone.replace(/[^\d]/g, "").slice(-10);
    if (seen.has(key)) continue;
    seen.add(key);
    recipients.push({ orderId: o.id, phone: o.customerPhone });
  }

  const broadcastId = `bc_${randomBytes(8).toString("hex")}`;
  let sent = 0;
  let failed = 0;

  // Send sequentially with a small delay to respect Twilio's 1-msg/sec
  // throughput on local long codes.
  for (const r of recipients) {
    const res = await sendSms({
      to: r.phone,
      body: text,
      orderId: r.orderId,
      broadcastId,
      campaign: "broadcast"
    });
    if (res.ok) sent++;
    else failed++;
    await new Promise((r) => setTimeout(r, 1100));
  }

  return NextResponse.json({ ok: true, broadcastId, sent, failed, total: recipients.length });
}
