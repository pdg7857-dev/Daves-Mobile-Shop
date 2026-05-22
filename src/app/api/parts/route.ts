import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parts = await prisma.part.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
  return NextResponse.json(parts);
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  for (const k of ["name", "category", "compatibleWith", "price"] as const) {
    if (body[k] === undefined || body[k] === "" || body[k] === null) {
      return NextResponse.json({ error: `Missing required field: ${k}` }, { status: 400 });
    }
  }
  const part = await prisma.part.create({
    data: {
      name: String(body.name),
      category: String(body.category),
      compatibleWith: String(body.compatibleWith),
      brand: body.brand ? String(body.brand) : null,
      price: Number(body.price),
      stock: body.stock != null ? Number(body.stock) : 0,
      imageUrl: body.imageUrl ? String(body.imageUrl) : null,
      description: body.description ? String(body.description) : null
    }
  });
  return NextResponse.json(part, { status: 201 });
}
