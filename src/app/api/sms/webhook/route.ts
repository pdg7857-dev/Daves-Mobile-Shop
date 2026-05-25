// Twilio webhook for inbound SMS — handles STOP / HELP keywords and logs
// every inbound message.
//
// Set this URL in Twilio: Phone Numbers → your number → Messaging →
//   "A MESSAGE COMES IN" webhook: POST  https://<your-site>/api/sms/webhook
//
// Twilio signs each request; we verify the signature using the auth token.

import { NextResponse } from "next/server";
import twilio from "twilio";
import { prisma } from "@/lib/db";
import { isStopKeyword, isHelpKeyword, unsubscribePhone } from "@/lib/sms";

function twiml(messageBody?: string) {
  const response = new twilio.twiml.MessagingResponse();
  if (messageBody) response.message(messageBody);
  return new Response(response.toString(), {
    headers: { "Content-Type": "text/xml" }
  });
}

export async function POST(req: Request) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((v, k) => {
    if (typeof v === "string") params[k] = v;
  });

  // Verify Twilio signature when we have an auth token.
  if (authToken) {
    const signature = req.headers.get("x-twilio-signature") || "";
    const url = req.url; // Twilio includes the full URL in its signature
    const ok = twilio.validateRequest(authToken, signature, url, params);
    if (!ok) {
      console.warn("SMS webhook: invalid Twilio signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }
  }

  const from = params.From || "";
  const body = (params.Body || "").trim();
  const to = params.To || "";

  // Log inbound
  await prisma.smsLog.create({
    data: {
      direction: "in",
      fromNumber: from,
      toNumber: to,
      body,
      campaign: "inbound",
      twilioSid: params.MessageSid || null,
      status: "received"
    }
  });

  if (isStopKeyword(body)) {
    const count = await unsubscribePhone(from);
    // Twilio carriers auto-handle STOP confirmation in many cases, but we
    // send our own so the customer always gets one.
    await prisma.smsLog.create({
      data: {
        direction: "out",
        toNumber: from,
        body: "You've been unsubscribed from Dave's Mobile SMS. We won't text you again. Reply HELP for info.",
        campaign: "stop_reply",
        status: "auto"
      }
    });
    return twiml(
      `You've been unsubscribed from Dave's Mobile SMS. We won't text you again. Reply HELP for info. (${count} order${count === 1 ? "" : "s"} updated.)`
    );
  }

  if (isHelpKeyword(body)) {
    const businessPhone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || "";
    return twiml(
      `Dave's Mobile Shop: Phone repair + refurbished phones across Canada. Reply STOP to opt out. Questions: ${businessPhone || "visit our site"}.`
    );
  }

  // Unknown inbound — pass through silently. Forward to admin via your
  // preferred notification channel if you want; for now we just log it.
  return twiml();
}
