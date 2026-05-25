// Daily marketing scheduler — runs once per day via Vercel Cron.
//
// Fires:
//  1. Dave Care drip campaign (4 emails over 30 days) for phone buyers
//     who skipped Dave Care
//  2. Review prompt (day 2 after delivery, plus day 10 nudge if no review)
//
// Protected by CRON_SECRET. Vercel Cron sets the Authorization header
// automatically using the configured secret in vercel.json.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendDaveCareDrip, sendReviewPrompt, type OrderForEmail } from "@/lib/email";

const DRIP_DAYS: Array<{ step: 1 | 2 | 3 | 4; days: number }> = [
  { step: 1, days: 3 },
  { step: 2, days: 10 },
  { step: 3, days: 20 },
  { step: 4, days: 30 }
];

const REVIEW_DAYS: Array<{ step: 1 | 2; days: number }> = [
  { step: 1, days: 2 },
  { step: 2, days: 10 }
];

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function isAuthed(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // require explicit secret in prod
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${secret}`;
}

async function toEmail(orderId: number): Promise<OrderForEmail | null> {
  const o = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { select: { name: true, quantity: true, unitPrice: true, itemType: true } } }
  });
  if (!o) return null;
  return o as unknown as OrderForEmail;
}

export async function GET(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const results = { daveCare: 0, reviews: 0, errors: [] as string[] };

  // ============ Dave Care drip ============
  // Eligible: paid orders that contain a phone, where no Dave Care plan was
  // added, and the customer hasn't unsubscribed from marketing.
  for (const { step, days } of DRIP_DAYS) {
    const cutoffOlder = daysAgo(days);
    const cutoffNewer = daysAgo(days + 7); // 7-day window so a slow cron doesn't miss anyone
    const orders = await prisma.order.findMany({
      where: {
        paidAt: { lte: cutoffOlder, gte: cutoffNewer },
        marketingUnsubscribedAt: null,
        items: { some: { itemType: "phone" } },
        daveCarePlans: { none: {} },
        campaignSends: { none: { campaign: "dave_care_drip", step } }
      },
      select: { id: true }
    });

    for (const { id } of orders) {
      try {
        const full = await toEmail(id);
        if (!full) continue;
        await sendDaveCareDrip(full, step);
        await prisma.emailCampaignSend.create({
          data: { orderId: id, campaign: "dave_care_drip", step }
        });
        results.daveCare++;
      } catch (e) {
        results.errors.push(`drip step ${step} order ${id}: ${e instanceof Error ? e.message : e}`);
      }
    }
  }

  // ============ Review prompts ============
  // Eligible: delivered orders containing a phone, customer hasn't left a
  // review yet (matched by email + phone), hasn't unsubscribed.
  for (const { step, days } of REVIEW_DAYS) {
    const cutoffOlder = daysAgo(days);
    const cutoffNewer = daysAgo(days + 7);
    const orders = await prisma.order.findMany({
      where: {
        deliveredAt: { lte: cutoffOlder, gte: cutoffNewer },
        marketingUnsubscribedAt: null,
        items: { some: { itemType: "phone" } },
        campaignSends: { none: { campaign: "review_prompt", step } }
      },
      select: { id: true, customerEmail: true, items: { select: { phoneId: true, itemType: true } } }
    });

    for (const o of orders) {
      const phoneIds = o.items.filter((i) => i.itemType === "phone" && i.phoneId).map((i) => i.phoneId!);
      if (phoneIds.length === 0) continue;
      const alreadyReviewed = await prisma.review.findFirst({
        where: { customerEmail: o.customerEmail, phoneId: { in: phoneIds } },
        select: { id: true }
      });
      if (alreadyReviewed) continue;

      try {
        const full = await toEmail(o.id);
        if (!full) continue;
        await sendReviewPrompt(full, step);
        await prisma.emailCampaignSend.create({
          data: { orderId: o.id, campaign: "review_prompt", step }
        });
        results.reviews++;
      } catch (e) {
        results.errors.push(`review step ${step} order ${o.id}: ${e instanceof Error ? e.message : e}`);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    sent: { daveCare: results.daveCare, reviews: results.reviews },
    errors: results.errors
  });
}
