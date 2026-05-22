import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

type IncomingRow = {
  rowNumber?: number;
  name: string;
  category: string;
  compatibleWith: string;
  brand?: string;
  price: string | number;
  stock?: string | number;
  imageUrl?: string;
  description?: string;
};

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const rows: IncomingRow[] = Array.isArray(body.rows) ? body.rows : [];
  if (rows.length === 0) return NextResponse.json({ error: "No rows provided" }, { status: 400 });

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const price = Number(row.price);
    if (!row.name || !row.category || !row.compatibleWith || !Number.isFinite(price)) {
      skipped++;
      errors.push(`Row ${row.rowNumber ?? "?"}: missing required field`);
      continue;
    }
    try {
      await prisma.part.create({
        data: {
          name: String(row.name).trim(),
          category: String(row.category).trim().toLowerCase(),
          compatibleWith: String(row.compatibleWith).trim(),
          brand: row.brand ? String(row.brand).trim() : null,
          price,
          stock: row.stock != null ? Number(row.stock) || 0 : 0,
          imageUrl: row.imageUrl ? String(row.imageUrl).trim() : null,
          description: row.description ? String(row.description).trim() : null
        }
      });
      created++;
    } catch (err) {
      skipped++;
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Row ${row.rowNumber ?? "?"}: ${msg}`);
    }
  }

  return NextResponse.json({ created, skipped, errors });
}
