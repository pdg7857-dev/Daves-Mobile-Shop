// First-party analytics ingestion. Receives a single pageview or event from
// the client tracker and writes to Postgres. Designed to fail silently so
// analytics issues never break user-facing flows.
//
// Geolocation is read from Vercel's free Edge headers (x-vercel-ip-*). On
// non-Vercel hosts these are absent; everything else still works.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Payload = {
  type: "pageview" | "event";
  path: string;
  referrer?: string;
  utm?: { source?: string; medium?: string; campaign?: string };
  sessionId: string;
  // For type=event
  name?: string;
  metadata?: Record<string, unknown>;
};

function deviceFromUA(ua: string): "mobile" | "tablet" | "desktop" {
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  return "desktop";
}

function sanitizePath(raw: string): string {
  if (!raw || typeof raw !== "string") return "/";
  // Drop query + hash; cap length
  return raw.split(/[?#]/)[0].slice(0, 200) || "/";
}

const VISITOR_COOKIE = "dms_vid";

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Visitor cookie set by middleware; fall back to header for first-party fetch
  const cookieHeader = req.headers.get("cookie") || "";
  const visitorId =
    cookieHeader
      .split(/;\s*/)
      .map((s) => s.split("="))
      .find(([k]) => k === VISITOR_COOKIE)?.[1] || "anon";

  const sessionId = String(body.sessionId || "").slice(0, 64);
  if (!sessionId) return NextResponse.json({ ok: false }, { status: 400 });

  const path = sanitizePath(body.path);

  try {
    if (body.type === "pageview") {
      const country = req.headers.get("x-vercel-ip-country") || null;
      const region = req.headers.get("x-vercel-ip-country-region") || null;
      const city = req.headers.get("x-vercel-ip-city") || null;
      const ua = req.headers.get("user-agent") || "";
      const referrer = body.referrer ? String(body.referrer).slice(0, 500) : null;

      await prisma.pageView.create({
        data: {
          path,
          referrer,
          utmSource: body.utm?.source?.toString().slice(0, 100) ?? null,
          utmMedium: body.utm?.medium?.toString().slice(0, 100) ?? null,
          utmCampaign: body.utm?.campaign?.toString().slice(0, 100) ?? null,
          country: country ?? null,
          region: region ?? null,
          city: city ? decodeURIComponent(city) : null,
          device: deviceFromUA(ua),
          visitorId,
          sessionId
        }
      });
    } else if (body.type === "event") {
      const name = String(body.name || "").slice(0, 60);
      if (!name) return NextResponse.json({ ok: false }, { status: 400 });
      await prisma.analyticsEvent.create({
        data: {
          name,
          path,
          visitorId,
          sessionId,
          metadata: body.metadata ? JSON.stringify(body.metadata).slice(0, 2000) : null
        }
      });
    }
  } catch (err) {
    console.error("track ingest failed:", err instanceof Error ? err.message : err);
  }

  return NextResponse.json({ ok: true });
}
