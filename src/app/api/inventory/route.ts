import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const phones = await prisma.phone.findMany({
    orderBy: { createdAt: "desc" },
    include: { supplier: true, repairs: true }
  });
  return NextResponse.json(phones);
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();

  const required = ["brand", "model", "condition", "purchasePrice", "purchaseDate"] as const;
  for (const k of required) {
    if (body[k] === undefined || body[k] === "" || body[k] === null) {
      return NextResponse.json({ error: `Missing required field: ${k}` }, { status: 400 });
    }
  }

  const data = {
    brand: String(body.brand),
    model: String(body.model),
    storage: body.storage ? String(body.storage) : null,
    color: body.color ? String(body.color) : null,
    condition: String(body.condition),
    imei: body.imei ? String(body.imei) : null,
    serial: body.serial ? String(body.serial) : null,
    purchasePrice: Number(body.purchasePrice),
    askingPrice: body.askingPrice ? Number(body.askingPrice) : null,
    status: body.status ? String(body.status) : "for_sale",
    purchaseDate: new Date(body.purchaseDate),
    purchasedFrom: body.purchasedFrom ? String(body.purchasedFrom) : null,
    supplierId: body.supplierId ? Number(body.supplierId) : null,
    notes: body.notes ? String(body.notes) : null,
    city: body.city ? String(body.city) : null,
    imageUrl: body.imageUrl ? String(body.imageUrl) : null
  };

  try {
    const phone = await prisma.phone.create({ data });
    return NextResponse.json(phone, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "A phone with that IMEI or serial already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
