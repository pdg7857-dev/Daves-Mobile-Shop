// SMS via Twilio.
//
// Required env vars (gracefully no-ops if missing):
//   TWILIO_ACCOUNT_SID   — from https://console.twilio.com
//   TWILIO_AUTH_TOKEN    — same console, masked by default
//   TWILIO_PHONE_NUMBER  — the Canadian long code, E.164 e.g. "+14375551234"
//
// All sends are best-effort: failures are logged but never block the
// order flow. Sends respect smsOptIn + marketingUnsubscribedAt.

import twilio from "twilio";
import { prisma } from "@/lib/db";

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!sid || !token || !from) return null;
  return { client: twilio(sid, token), from };
}

function toE164(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (raw.startsWith("+")) return raw.replace(/\s+/g, "");
  return null;
}

type SendOpts = {
  to: string;
  body: string;
  orderId?: number;
  broadcastId?: string;
  campaign: string;
};

export async function sendSms(opts: SendOpts): Promise<{ ok: boolean; sid?: string; error?: string }> {
  const e164 = toE164(opts.to);
  if (!e164) {
    return { ok: false, error: "Invalid phone number" };
  }
  const c = getClient();
  if (!c) {
    console.log("SMS skipped (Twilio env vars not set):", opts.campaign, "→", e164);
    await prisma.smsLog.create({
      data: {
        direction: "out",
        toNumber: e164,
        body: opts.body,
        orderId: opts.orderId ?? null,
        broadcastId: opts.broadcastId ?? null,
        campaign: opts.campaign,
        status: "skipped",
        error: "Twilio not configured"
      }
    });
    return { ok: false, error: "Twilio not configured" };
  }
  try {
    const msg = await c.client.messages.create({
      from: c.from,
      to: e164,
      body: opts.body
    });
    await prisma.smsLog.create({
      data: {
        direction: "out",
        toNumber: e164,
        fromNumber: c.from,
        body: opts.body,
        orderId: opts.orderId ?? null,
        broadcastId: opts.broadcastId ?? null,
        twilioSid: msg.sid,
        status: msg.status,
        campaign: opts.campaign
      }
    });
    return { ok: true, sid: msg.sid };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.smsLog.create({
      data: {
        direction: "out",
        toNumber: e164,
        fromNumber: c.from,
        body: opts.body,
        orderId: opts.orderId ?? null,
        broadcastId: opts.broadcastId ?? null,
        campaign: opts.campaign,
        status: "failed",
        error: message
      }
    });
    return { ok: false, error: message };
  }
}

// ============================================================================
// Order-driven transactional SMS
// ============================================================================

type OrderForSms = {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string | null;
  smsOptIn: boolean;
  marketingUnsubscribedAt: Date | null;
  trackingNumber: string | null;
  carrier: string | null;
};

function trackingUrl(carrier: string | null, tracking: string): string | null {
  if (!tracking) return null;
  const t = encodeURIComponent(tracking);
  switch ((carrier || "").toLowerCase()) {
    case "canada post":
      return `https://www.canadapost-postescanada.ca/track-reperage/en#/details/${t}`;
    case "purolator":
      return `https://www.purolator.com/en/shipping/tracker?pin=${t}`;
    case "ups":
      return `https://www.ups.com/track?tracknum=${t}`;
    case "fedex":
      return `https://www.fedex.com/fedextrack/?trknbr=${t}`;
    case "dhl":
      return `https://www.dhl.com/ca-en/home/tracking/tracking-express.html?tracking-id=${t}`;
    default:
      return null;
  }
}

function canSendTo(order: OrderForSms): boolean {
  return !!(order.smsOptIn && order.customerPhone && !order.marketingUnsubscribedAt);
}

export async function sendOrderShippedSms(order: OrderForSms): Promise<void> {
  if (!canSendTo(order)) return;
  const fn = order.customerName.split(" ")[0];
  const trackLink = order.trackingNumber ? trackingUrl(order.carrier, order.trackingNumber) : null;
  const body = trackLink
    ? `Dave's Mobile: Hi ${fn}! Order ${order.orderNumber} just shipped via ${order.carrier ?? "courier"}. Track: ${trackLink}  Reply STOP to opt out.`
    : `Dave's Mobile: Hi ${fn}! Order ${order.orderNumber} just shipped. We'll send the tracking number shortly. Reply STOP to opt out.`;
  await sendSms({
    to: order.customerPhone!,
    body,
    orderId: order.id,
    campaign: "shipped"
  });
}

export async function sendOrderDeliveredSms(order: OrderForSms): Promise<void> {
  if (!canSendTo(order)) return;
  const fn = order.customerName.split(" ")[0];
  const siteBase = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/^<|>$/g, "").replace(/\/$/, "");
  const reviewLink = siteBase
    ? `${siteBase}/orders/${encodeURIComponent(order.orderNumber)}#review`
    : "your order page";
  const body = `Dave's Mobile: Your order ${order.orderNumber} arrived, ${fn}! Hope you love it. Mind a quick review? ${reviewLink}  Reply STOP to opt out.`;
  await sendSms({
    to: order.customerPhone!,
    body,
    orderId: order.id,
    campaign: "delivered"
  });
}

// ============================================================================
// STOP / HELP keyword handlers
// ============================================================================

const STOP_KEYWORDS = new Set(["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "QUIT", "END", "OPT OUT", "OPTOUT"]);
const HELP_KEYWORDS = new Set(["HELP", "INFO", "AIDE"]);

export function isStopKeyword(body: string): boolean {
  return STOP_KEYWORDS.has(body.trim().toUpperCase());
}

export function isHelpKeyword(body: string): boolean {
  return HELP_KEYWORDS.has(body.trim().toUpperCase());
}

/** Unsubscribe every order that matches the inbound number. Returns count. */
export async function unsubscribePhone(rawPhone: string): Promise<number> {
  const e164 = toE164(rawPhone);
  if (!e164) return 0;
  // Twilio sends to numbers in E.164. Our stored numbers may be free-form,
  // so match on the last 10 digits (NANP) to catch (437) 555-0123 etc.
  const last10 = e164.replace(/[^\d]/g, "").slice(-10);
  const orders = await prisma.order.findMany({
    where: { customerPhone: { contains: last10 }, marketingUnsubscribedAt: null },
    select: { id: true }
  });
  if (orders.length === 0) return 0;
  await prisma.order.updateMany({
    where: { id: { in: orders.map((o) => o.id) } },
    data: { marketingUnsubscribedAt: new Date() }
  });
  return orders.length;
}
