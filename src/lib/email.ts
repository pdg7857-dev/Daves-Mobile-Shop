// Customer email notifications via Resend.
//
// Required env vars (gracefully no-ops if missing):
//   RESEND_API_KEY  — get from https://resend.com/api-keys
//   EMAIL_FROM      — verified sender, e.g. "Dave's Mobile <orders@davesmobile.ca>"
//
// All sends are best-effort: failures are logged but never block the
// order flow. Customer order placement, shipping, and delivery all trigger
// from API routes.

import { Resend } from "resend";
import { getSiteUrl } from "@/lib/site-url";

type LineItem = {
  name: string;
  quantity: number;
  unitPrice: number;
};

export type OrderForEmail = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  addressLine1: string;
  addressLine2: string | null;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  trackingNumber: string | null;
  carrier: string | null;
  items: LineItem[];
};

function getClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

async function send(opts: { to: string; subject: string; html: string; text: string }) {
  const client = getClient();
  if (!client) {
    console.log("Email skipped (RESEND_API_KEY not set):", opts.subject, "→", opts.to);
    return;
  }
  const from = process.env.EMAIL_FROM || "Dave's Mobile Shop <onboarding@resend.dev>";
  try {
    const res = await client.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text
    });
    if (res.error) {
      console.error("Resend error:", res.error);
    }
  } catch (err) {
    console.error("Email send failed:", err instanceof Error ? err.message : err);
  }
}

// ---------- HTML helpers ----------

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

const BRAND = "Dave's Mobile Shop";
const BRAND_COLOR = "#0071e3";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emailShell(opts: { preheader: string; title: string; bodyHtml: string }): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,sans-serif;color:#1d1d1f;">
  <!-- preheader (hidden, shows in inbox preview) -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f5f5f7;">${escapeHtml(opts.preheader)}</div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f5f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;">
          <tr><td style="padding:32px 32px 0 32px;text-align:center;">
            <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND_COLOR};">${escapeHtml(BRAND)}</p>
          </td></tr>
          <tr><td style="padding:8px 32px 32px 32px;">${opts.bodyHtml}</td></tr>
          <tr><td style="padding:24px 32px;border-top:1px solid #e5e5e7;text-align:center;color:#86868b;font-size:12px;line-height:1.5;">
            <p style="margin:0 0 8px 0;">© ${new Date().getFullYear()} ${escapeHtml(BRAND)}. 180-day warranty on every phone · 90-day on every repair.</p>
            <p style="margin:0;">Questions? Reply to this email or message us — we&rsquo;re open 7 days, 8 AM – 9 PM ET.</p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function itemsTable(items: LineItem[]): string {
  const rows = items
    .map(
      (i) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f2;font-size:14px;color:#1d1d1f;">
        ${escapeHtml(i.name)}
        ${i.quantity > 1 ? `<div style="color:#86868b;font-size:12px;margin-top:2px;">Qty ${i.quantity}</div>` : ""}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f2;font-size:14px;color:#1d1d1f;text-align:right;white-space:nowrap;">
        ${money(i.unitPrice * i.quantity)}
      </td>
    </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:16px 0;">${rows}</table>`;
}

function totalsBlock(o: OrderForEmail): string {
  const rows: string[] = [];
  rows.push(`<tr><td style="padding:4px 0;color:#86868b;font-size:13px;">Subtotal</td><td style="padding:4px 0;text-align:right;font-size:13px;">${money(o.subtotal)}</td></tr>`);
  if (o.discountAmount > 0) {
    rows.push(`<tr><td style="padding:4px 0;color:#86868b;font-size:13px;">Discount</td><td style="padding:4px 0;text-align:right;font-size:13px;color:#22863a;">-${money(o.discountAmount)}</td></tr>`);
  }
  rows.push(`<tr><td style="padding:4px 0;color:#86868b;font-size:13px;">Shipping</td><td style="padding:4px 0;text-align:right;font-size:13px;">${money(o.shippingCost)}</td></tr>`);
  rows.push(`<tr><td style="padding:4px 0;color:#86868b;font-size:13px;">Tax</td><td style="padding:4px 0;text-align:right;font-size:13px;">${money(o.taxAmount)}</td></tr>`);
  rows.push(`<tr><td style="padding:12px 0 4px 0;font-size:15px;font-weight:600;border-top:1px solid #d2d2d7;">Total</td><td style="padding:12px 0 4px 0;text-align:right;font-size:15px;font-weight:600;border-top:1px solid #d2d2d7;">${money(o.total)}</td></tr>`);
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${rows.join("")}</table>`;
}

function shippingAddressBlock(o: OrderForEmail): string {
  const addr2 = o.addressLine2 ? `<br>${escapeHtml(o.addressLine2)}` : "";
  return `<div style="background:#f5f5f7;border-radius:12px;padding:16px 18px;margin:16px 0;font-size:14px;line-height:1.55;color:#1d1d1f;">
    <p style="margin:0;font-weight:600;">${escapeHtml(o.customerName)}</p>
    <p style="margin:4px 0 0 0;color:#1d1d1f;">${escapeHtml(o.addressLine1)}${addr2}<br>${escapeHtml(o.city)}, ${escapeHtml(o.province)} ${escapeHtml(o.postalCode)}<br>${escapeHtml(o.country)}</p>
  </div>`;
}

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

function button(href: string, label: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px auto;">
    <tr><td style="border-radius:999px;background:${BRAND_COLOR};">
      <a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:500;color:#fff;text-decoration:none;border-radius:999px;">${escapeHtml(label)}</a>
    </td></tr>
  </table>`;
}

function siteUrl(path: string): string {
  return `${getSiteUrl()}${path}`;
}

// ---------- Templates ----------

export async function sendOrderConfirmation(order: OrderForEmail) {
  const orderUrl = siteUrl(`/orders/${encodeURIComponent(order.orderNumber)}`);
  const subject = `Order ${order.orderNumber} confirmed — ${BRAND}`;
  const preheader = `Thanks ${order.customerName.split(" ")[0]}! Your order ${order.orderNumber} is in.`;
  const body = `
    <h1 style="margin:16px 0 8px 0;font-size:28px;line-height:1.2;letter-spacing:-0.02em;font-weight:600;color:#1d1d1f;text-align:center;">Thanks for your order.</h1>
    <p style="margin:0 0 16px 0;text-align:center;color:#86868b;font-size:15px;">Order <strong style="color:#1d1d1f;">${escapeHtml(order.orderNumber)}</strong></p>
    <p style="margin:16px 0;font-size:15px;line-height:1.55;color:#1d1d1f;">Hi ${escapeHtml(order.customerName.split(" ")[0])}, we&rsquo;ve received your order and are getting it ready to ship. You&rsquo;ll get another email the moment it leaves our hub with tracking info.</p>
    <h2 style="margin:28px 0 4px 0;font-size:15px;font-weight:600;color:#1d1d1f;">In your order</h2>
    ${itemsTable(order.items)}
    ${totalsBlock(order)}
    <h2 style="margin:28px 0 4px 0;font-size:15px;font-weight:600;color:#1d1d1f;">Shipping to</h2>
    ${shippingAddressBlock(order)}
    ${button(orderUrl, "View order")}
    <p style="margin:24px 0 0 0;font-size:13px;line-height:1.55;color:#86868b;text-align:center;">Every phone ships with a 180-day warranty and 30-day money-back guarantee.</p>
  `;
  await send({
    to: order.customerEmail,
    subject,
    html: emailShell({ preheader, title: subject, bodyHtml: body }),
    text: `Thanks for your order ${order.orderNumber}!\n\nWe've received your order and are getting it ready to ship. You'll get another email with tracking the moment it leaves our hub.\n\nTotal: ${money(order.total)}\n\nView your order: ${orderUrl}\n\n— ${BRAND}`
  });
}

export async function sendOrderShipped(order: OrderForEmail) {
  const orderUrl = siteUrl(`/orders/${encodeURIComponent(order.orderNumber)}`);
  const trackUrl = order.trackingNumber ? trackingUrl(order.carrier, order.trackingNumber) : null;
  const subject = `Your order ${order.orderNumber} is on the way 📦`;
  const preheader = order.trackingNumber
    ? `Tracking: ${order.trackingNumber} (${order.carrier ?? "carrier"})`
    : "Your order has shipped.";
  const trackingBlock = order.trackingNumber
    ? `<div style="background:#f5f5f7;border-radius:12px;padding:18px;margin:20px 0;text-align:center;">
        <p style="margin:0 0 4px 0;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#86868b;">${escapeHtml(order.carrier ?? "Tracking number")}</p>
        <p style="margin:0;font-size:18px;font-weight:600;font-family:'SF Mono',Menlo,monospace;color:#1d1d1f;">${escapeHtml(order.trackingNumber)}</p>
      </div>`
    : "";
  const body = `
    <h1 style="margin:16px 0 8px 0;font-size:28px;line-height:1.2;letter-spacing:-0.02em;font-weight:600;color:#1d1d1f;text-align:center;">It&rsquo;s on the way.</h1>
    <p style="margin:0 0 16px 0;text-align:center;color:#86868b;font-size:15px;">Order <strong style="color:#1d1d1f;">${escapeHtml(order.orderNumber)}</strong></p>
    <p style="margin:16px 0;font-size:15px;line-height:1.55;color:#1d1d1f;">Hi ${escapeHtml(order.customerName.split(" ")[0])}, your order just left our hub. ${trackUrl ? "Tap the button below to track it in real time." : "We&rsquo;ll let you know when it arrives."}</p>
    ${trackingBlock}
    ${trackUrl ? button(trackUrl, "Track shipment") : button(orderUrl, "View order")}
    <h2 style="margin:28px 0 4px 0;font-size:15px;font-weight:600;color:#1d1d1f;">Shipping to</h2>
    ${shippingAddressBlock(order)}
    <p style="margin:24px 0 0 0;font-size:13px;line-height:1.55;color:#86868b;text-align:center;">Expecting it within 2-5 business days. If anything goes sideways, reply to this email — we&rsquo;re on it.</p>
  `;
  await send({
    to: order.customerEmail,
    subject,
    html: emailShell({ preheader, title: subject, bodyHtml: body }),
    text: `Your order ${order.orderNumber} has shipped.${order.trackingNumber ? `\n\nTracking: ${order.trackingNumber} (${order.carrier ?? "carrier"})${trackUrl ? `\nTrack: ${trackUrl}` : ""}` : ""}\n\nView order: ${orderUrl}\n\n— ${BRAND}`
  });
}

// ---------- Dave Care drip campaign ----------
// Four-touch sequence for buyers who skipped Dave Care at checkout.

type DripCopy = { subject: string; preheader: string; heading: string; body: string };

const DRIP_COPY: Record<1 | 2 | 3 | 4, (firstName: string) => DripCopy> = {
  1: (fn) => ({
    subject: `Loving your new phone, ${fn}?`,
    preheader: "A quick thought on protecting it.",
    heading: "Hope it&rsquo;s all you wanted.",
    body: `Hi ${fn}, just checking in — how&rsquo;s your new phone working out? You skipped Dave Care at checkout, which is totally fine, but the most common breakage we see (cracked screen, dead battery) usually happens in the first 90 days. Dave Care still covers your device if you add it now.`
  }),
  2: (fn) => ({
    subject: `${fn}, here&rsquo;s what we see most often`,
    preheader: "The 4 things that break, and what they cost.",
    heading: "What goes wrong, and what it costs.",
    body: `From the last 12 months at our bench:<br><br>
      &nbsp;&nbsp;• Cracked screen — <strong>$199–$329</strong><br>
      &nbsp;&nbsp;• Dead battery — <strong>$59–$79</strong><br>
      &nbsp;&nbsp;• Camera glass — <strong>$89–$149</strong><br>
      &nbsp;&nbsp;• Back glass — <strong>$99–$159</strong><br><br>
      Dave Care covers all four — one of each, every 12 months — for $97/yr. That&rsquo;s less than a single screen swap.`
  }),
  3: (fn) => ({
    subject: `Add Dave Care for $97 — limited offer`,
    preheader: "Last week to add coverage to this purchase.",
    heading: "One-time offer.",
    body: `Hi ${fn}, this is the last week we can add Dave Care to your original purchase at the new-buyer rate. After day 30, it&rsquo;s available but at the renewal rate. Hit the button below to add it to your account.`
  }),
  4: (fn) => ({
    subject: `Last call: Dave Care closes tomorrow`,
    preheader: "After tomorrow, coverage is only available at renewal pricing.",
    heading: "Last day to add coverage.",
    body: `${fn}, tomorrow is the last day you can add Dave Care to your original purchase. After this, you can still buy it, but you&rsquo;ll have to wait for the next renewal cycle. One click below adds it now.`
  })
};

export async function sendDaveCareDrip(order: OrderForEmail, step: 1 | 2 | 3 | 4) {
  const fn = order.customerName.split(" ")[0];
  const copy = DRIP_COPY[step](fn);
  const addUrl = siteUrl(`/orders/${encodeURIComponent(order.orderNumber)}?addDaveCare=1`);
  const unsub = siteUrl(`/orders/${encodeURIComponent(order.orderNumber)}?unsubscribe=1`);
  const body = `
    <h1 style="margin:16px 0 8px 0;font-size:28px;line-height:1.2;letter-spacing:-0.02em;font-weight:600;color:#1d1d1f;text-align:center;">${copy.heading}</h1>
    <p style="margin:16px 0;font-size:15px;line-height:1.6;color:#1d1d1f;">${copy.body}</p>
    <div style="background:#f5f5f7;border-radius:12px;padding:20px;margin:24px 0;">
      <p style="margin:0 0 4px 0;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND_COLOR};">Dave Care annual</p>
      <p style="margin:0 0 8px 0;font-size:24px;font-weight:600;color:#1d1d1f;">${money(97)}<span style="font-size:14px;color:#86868b;font-weight:400;"> / year</span></p>
      <p style="margin:0;font-size:13px;line-height:1.5;color:#1d1d1f;">1 screen + 1 battery + 1 camera + 1 back-glass replacement, every 12 months. Covers <strong>this</strong> device only.</p>
    </div>
    ${button(addUrl, "Add Dave Care to my order")}
    <p style="margin:24px 0 0 0;font-size:12px;line-height:1.5;color:#86868b;text-align:center;">
      Not interested? <a href="${escapeHtml(unsub)}" style="color:#86868b;text-decoration:underline;">Unsubscribe from these reminders.</a>
    </p>
  `;
  await send({
    to: order.customerEmail,
    subject: copy.subject,
    html: emailShell({ preheader: copy.preheader, title: copy.subject, bodyHtml: body }),
    text: `${copy.heading.replace(/&[a-z]+;/g, "'")}\n\nAdd Dave Care: ${addUrl}\n\nUnsubscribe: ${unsub}\n\n— ${BRAND}`
  });
}

// ---------- Review prompt ----------

export async function sendReviewPrompt(order: OrderForEmail, step: 1 | 2) {
  const fn = order.customerName.split(" ")[0];
  const phoneItem = order.items.find((i) => i.name); // first item, usually the phone
  const phoneLabel = phoneItem?.name ?? "your new phone";
  const reviewUrl = siteUrl(`/orders/${encodeURIComponent(order.orderNumber)}#review`);
  const isNudge = step === 2;
  const subject = isNudge
    ? `${fn}, 30 seconds to leave a review?`
    : `How&rsquo;s your new phone, ${fn}?`;
  const preheader = isNudge
    ? "Your honest take helps other buyers — and means the world to us."
    : "Mind sharing a quick review + photo?";
  const body = `
    <h1 style="margin:16px 0 8px 0;font-size:28px;line-height:1.2;letter-spacing:-0.02em;font-weight:600;color:#1d1d1f;text-align:center;">
      ${isNudge ? "A small ask." : "How&rsquo;s it going?"}
    </h1>
    <p style="margin:16px 0;font-size:15px;line-height:1.6;color:#1d1d1f;">
      Hi ${escapeHtml(fn)}, your <strong>${escapeHtml(phoneLabel)}</strong> should be settled in by now.
      ${isNudge
        ? "I noticed you haven&rsquo;t left a review yet — totally understand, life is busy. But 30 seconds of your honest take genuinely helps other buyers decide, and it means a lot to a small shop like ours."
        : "If you&rsquo;ve got 60 seconds, would you share a quick review — and maybe a photo of the new device? It helps other buyers see real-world condition, and it means a lot to a small shop like ours."}
    </p>
    <div style="background:#f5f5f7;border-radius:12px;padding:20px;margin:24px 0;text-align:center;">
      <p style="margin:0 0 12px 0;font-size:14px;color:#1d1d1f;font-weight:500;">5-star reviews + photos work magic.</p>
      <p style="margin:0;font-size:32px;letter-spacing:4px;color:#f59e0b;">★ ★ ★ ★ ★</p>
    </div>
    ${button(reviewUrl, isNudge ? "Leave a quick review" : "Write my review")}
    <p style="margin:24px 0 0 0;font-size:13px;line-height:1.5;color:#86868b;text-align:center;">
      ${isNudge ? "If now isn&rsquo;t the time, no worries — this is the last reminder." : "Honest reviews — good or bad — are most welcome. We grow from them."}
    </p>
  `;
  await send({
    to: order.customerEmail,
    subject,
    html: emailShell({ preheader, title: subject, bodyHtml: body }),
    text: `Hi ${fn}, would you take 60 seconds to leave a review of your ${phoneLabel}?\n\n${reviewUrl}\n\n— ${BRAND}`
  });
}

export async function sendOrderDelivered(order: OrderForEmail) {
  const orderUrl = siteUrl(`/orders/${encodeURIComponent(order.orderNumber)}`);
  const subject = `Your order ${order.orderNumber} has arrived 🎉`;
  const preheader = `Enjoy! Your 180-day warranty starts today.`;
  const body = `
    <h1 style="margin:16px 0 8px 0;font-size:28px;line-height:1.2;letter-spacing:-0.02em;font-weight:600;color:#1d1d1f;text-align:center;">Delivered.</h1>
    <p style="margin:0 0 16px 0;text-align:center;color:#86868b;font-size:15px;">Order <strong style="color:#1d1d1f;">${escapeHtml(order.orderNumber)}</strong></p>
    <p style="margin:16px 0;font-size:15px;line-height:1.55;color:#1d1d1f;">Hi ${escapeHtml(order.customerName.split(" ")[0])}, your order just arrived. Hope it&rsquo;s everything you wanted.</p>
    <div style="background:#f5f5f7;border-radius:12px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:${BRAND_COLOR};">Your warranty starts today</p>
      <p style="margin:0;font-size:14px;line-height:1.55;color:#1d1d1f;">180 days of full warranty coverage. If anything goes wrong, message us &mdash; no fine print.</p>
    </div>
    ${button(orderUrl, "View order")}
    <p style="margin:24px 0 0 0;font-size:13px;line-height:1.55;color:#86868b;text-align:center;">Loved it? A review on Google or Facebook means the world to a small shop like ours.</p>
  `;
  await send({
    to: order.customerEmail,
    subject,
    html: emailShell({ preheader, title: subject, bodyHtml: body }),
    text: `Your order ${order.orderNumber} has been delivered. Hope it's everything you wanted!\n\nYour 180-day warranty starts today. If anything goes wrong, just reply to this email.\n\nView order: ${orderUrl}\n\n— ${BRAND}`
  });
}
