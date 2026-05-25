import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Body = {
  phoneId: number;
  rating: number;
  title?: string | null;
  body: string;
  customerName: string;
  customerEmail: string;
  orderNumber?: string | null;
  photos?: string[];
};

const RATE_LIMIT_WINDOW_MS = 1000 * 60 * 60; // 1 hour
const MAX_REVIEWS_PER_EMAIL_PER_HOUR = 3;

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Validation
  const phoneId = Number(body.phoneId);
  const rating = Number(body.rating);
  const name = String(body.customerName || "").trim();
  const email = String(body.customerEmail || "").trim().toLowerCase();
  const review = String(body.body || "").trim();
  const title = body.title ? String(body.title).trim().slice(0, 120) : null;
  const orderNumber = body.orderNumber ? String(body.orderNumber).trim().toUpperCase() : null;
  const photos = Array.isArray(body.photos) ? body.photos.filter((p) => typeof p === "string").slice(0, 3) : [];

  if (!Number.isInteger(phoneId) || phoneId <= 0) return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  if (rating < 1 || rating > 5) return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  if (review.length < 10) return NextResponse.json({ error: "Review too short" }, { status: 400 });
  if (review.length > 4000) return NextResponse.json({ error: "Review too long (max 4000 chars)" }, { status: 400 });

  // Rate limit per email
  const recent = await prisma.review.count({
    where: { customerEmail: email, createdAt: { gte: new Date(Date.now() - RATE_LIMIT_WINDOW_MS) } }
  });
  if (recent >= MAX_REVIEWS_PER_EMAIL_PER_HOUR) {
    return NextResponse.json({ error: "Too many reviews from this email in the last hour. Try again later." }, { status: 429 });
  }

  // Confirm phone exists
  const phone = await prisma.phone.findUnique({ where: { id: phoneId }, select: { id: true } });
  if (!phone) return NextResponse.json({ error: "Phone not found" }, { status: 404 });

  // Optional: link to an order if the customer provided one that matches their email
  let orderId: number | null = null;
  if (orderNumber) {
    const order = await prisma.order.findFirst({
      where: { orderNumber, customerEmail: email },
      select: { id: true }
    });
    if (order) orderId = order.id;
  }

  const r = await prisma.review.create({
    data: {
      phoneId,
      orderId,
      customerName: name.slice(0, 120),
      customerEmail: email,
      rating,
      title,
      body: review,
      photos,
      status: "approved"
    },
    select: { id: true }
  });

  return NextResponse.json({ ok: true, id: r.id });
}
