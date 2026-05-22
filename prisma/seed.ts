import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const IPHONE_MODELS = [
  "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
  "iPhone 12 mini", "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max",
  "iPhone 13 mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max",
  "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
  "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
  "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max"
];

// Indicative wholesale-adjacent pricing — Dave should adjust MSRP per row.
const SCREEN_PRICE: Record<string, number> = {
  "iPhone 11": 79.99, "iPhone 11 Pro": 139.99, "iPhone 11 Pro Max": 169.99,
  "iPhone 12 mini": 109.99, "iPhone 12": 119.99, "iPhone 12 Pro": 159.99, "iPhone 12 Pro Max": 189.99,
  "iPhone 13 mini": 139.99, "iPhone 13": 149.99, "iPhone 13 Pro": 199.99, "iPhone 13 Pro Max": 229.99,
  "iPhone 14": 169.99, "iPhone 14 Plus": 189.99, "iPhone 14 Pro": 239.99, "iPhone 14 Pro Max": 269.99,
  "iPhone 15": 199.99, "iPhone 15 Plus": 219.99, "iPhone 15 Pro": 269.99, "iPhone 15 Pro Max": 299.99,
  "iPhone 16": 229.99, "iPhone 16 Plus": 249.99, "iPhone 16 Pro": 299.99, "iPhone 16 Pro Max": 329.99
};

const BATTERY_PRICE: Record<string, number> = {
  "iPhone 11": 29.99, "iPhone 11 Pro": 34.99, "iPhone 11 Pro Max": 39.99,
  "iPhone 12 mini": 34.99, "iPhone 12": 39.99, "iPhone 12 Pro": 39.99, "iPhone 12 Pro Max": 44.99,
  "iPhone 13 mini": 39.99, "iPhone 13": 44.99, "iPhone 13 Pro": 49.99, "iPhone 13 Pro Max": 54.99,
  "iPhone 14": 49.99, "iPhone 14 Plus": 54.99, "iPhone 14 Pro": 59.99, "iPhone 14 Pro Max": 64.99,
  "iPhone 15": 54.99, "iPhone 15 Plus": 59.99, "iPhone 15 Pro": 64.99, "iPhone 15 Pro Max": 69.99,
  "iPhone 16": 59.99, "iPhone 16 Plus": 64.99, "iPhone 16 Pro": 69.99, "iPhone 16 Pro Max": 74.99
};

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.repair.deleteMany();
  await prisma.phone.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.part.deleteMany();
  await prisma.discountCode.deleteMany();
  await prisma.settings.deleteMany();

  await prisma.settings.create({
    data: { id: 1, shippingFlatRate: 15, freeShippingThreshold: 200 }
  });

  const wholesaler = await prisma.supplier.create({
    data: { name: "Nexus Cellular", contact: "orders@nexuscellular.com", notes: "Primary wholesale parts and device supplier" }
  });
  const tradeIn = await prisma.supplier.create({
    data: { name: "Customer trade-in", notes: "Walk-in customer trade-ins and buybacks" }
  });

  const phones = [
    { brand: "Apple", model: "iPhone 13 Pro", storage: "128GB", color: "Sierra Blue", condition: "Like New", imei: "356789012345671", serial: "FK7CD3X1N9", purchasePrice: 420, askingPrice: 599, status: "for_sale", purchaseDate: new Date("2026-04-10"), supplierId: wholesaler.id, city: "gta", notes: "Battery health 92%. New OEM screen installed." },
    { brand: "Apple", model: "iPhone 14", storage: "256GB", color: "Midnight", condition: "Good", imei: "356789012345672", serial: "FK7CD3X1N0", purchasePrice: 480, askingPrice: 679, status: "for_sale", purchaseDate: new Date("2026-04-22"), supplierId: tradeIn.id, city: "montreal", notes: "Minor scuff on bottom edge." },
    { brand: "Samsung", model: "Galaxy S22", storage: "128GB", color: "Phantom Black", condition: "Good", imei: "356789012345673", serial: "RZ8N20XYAB", purchasePrice: 280, askingPrice: 449, status: "for_sale", purchaseDate: new Date("2026-04-30"), supplierId: wholesaler.id, city: "ottawa" },
    { brand: "Google", model: "Pixel 7", storage: "128GB", color: "Obsidian", condition: "Good", imei: "356789012345674", serial: "GPX7-001", purchasePrice: 240, askingPrice: 379, status: "for_sale", purchaseDate: new Date("2026-05-02"), supplierId: wholesaler.id, city: "halifax" },
    { brand: "Apple", model: "iPhone 12", storage: "64GB", color: "White", condition: "Fair", imei: "356789012345675", serial: "FK7CD3X1N2", purchasePrice: 200, askingPrice: 329, status: "for_sale", purchaseDate: new Date("2026-05-05"), supplierId: tradeIn.id, city: "quebec-city", notes: "Battery replaced. Light wear on housing." },
    { brand: "Apple", model: "iPhone 11", storage: "64GB", color: "Black", condition: "Good", imei: "356789012345676", serial: "FK7CD3X1N3", purchasePrice: 150, askingPrice: 259, status: "for_sale", purchaseDate: new Date("2026-05-10"), supplierId: tradeIn.id, city: "moncton" }
  ];

  for (const p of phones) {
    const created = await prisma.phone.create({ data: p });
    if (p.notes?.includes("screen")) {
      await prisma.repair.create({ data: { phoneId: created.id, serviceType: "screen", description: "Replaced cracked OEM screen with new OEM display assembly", partCost: 120, laborCost: 40, performedBy: "Dave" } });
    }
    if (p.notes?.includes("Battery replaced")) {
      await prisma.repair.create({ data: { phoneId: created.id, serviceType: "battery", description: "Replaced battery — original health 71%, new battery installed", partCost: 25, laborCost: 30, performedBy: "Dave" } });
    }
  }

  const parts: Array<{ name: string; category: string; compatibleWith: string; brand: string; price: number; stock: number; description?: string }> = [];

  for (const m of IPHONE_MODELS) {
    parts.push({ name: `${m} OEM Screen Assembly`, category: "screen", compatibleWith: m, brand: "OEM", price: SCREEN_PRICE[m] ?? 99.99, stock: 5, description: "Replacement display assembly. Adjust MSRP from /admin/parts." });
  }
  for (const m of IPHONE_MODELS) {
    parts.push({ name: `${m} OEM Battery`, category: "battery", compatibleWith: m, brand: "OEM", price: BATTERY_PRICE[m] ?? 39.99, stock: 15, description: "Genuine OEM-grade battery. Adjust MSRP from /admin/parts." });
  }
  for (const m of IPHONE_MODELS.filter((m) => m.includes("Pro"))) {
    parts.push({ name: `${m} Rear Camera Module`, category: "camera", compatibleWith: m, brand: "OEM", price: 89.99, stock: 4 });
  }
  for (const m of IPHONE_MODELS.filter((m) => !m.includes("Pro"))) {
    parts.push({ name: `${m} Rear Camera Module`, category: "camera", compatibleWith: m, brand: "OEM", price: 59.99, stock: 6 });
  }
  for (const m of IPHONE_MODELS) {
    parts.push({ name: `${m} Front Camera`, category: "camera", compatibleWith: m, brand: "OEM", price: 34.99, stock: 8 });
  }
  for (const m of IPHONE_MODELS) {
    parts.push({ name: `${m} Charging Port Flex Cable`, category: "charging-port", compatibleWith: m, brand: "OEM", price: 24.99, stock: 12 });
  }
  for (const m of IPHONE_MODELS) {
    parts.push({ name: `${m} Back Glass`, category: "housing", compatibleWith: m, brand: "OEM", price: m.includes("Pro Max") ? 79.99 : m.includes("Pro") ? 69.99 : 49.99, stock: 6 });
  }
  parts.push({ name: "iPhone Earpiece Speaker (universal)", category: "speaker", compatibleWith: "iPhone 11–16 series", brand: "OEM", price: 14.99, stock: 30 });
  for (const m of IPHONE_MODELS) {
    parts.push({ name: `${m} Loudspeaker`, category: "speaker", compatibleWith: m, brand: "OEM", price: 18.99, stock: 10 });
  }
  parts.push(
    { name: "Tempered Glass Screen Protector (Universal)", category: "accessory", compatibleWith: "iPhone 11 through iPhone 16 (all)", brand: "Aftermarket", price: 9.99, stock: 100 },
    { name: "20W USB-C Power Adapter", category: "accessory", compatibleWith: "All USB-C devices", brand: "Aftermarket", price: 19.99, stock: 60 },
    { name: "USB-C to Lightning Cable (1m)", category: "accessory", compatibleWith: "iPhone 11–14 series", brand: "Aftermarket", price: 14.99, stock: 80 },
    { name: "USB-C to USB-C Cable (1m)", category: "accessory", compatibleWith: "iPhone 15–16 series", brand: "Aftermarket", price: 14.99, stock: 80 }
  );

  for (const part of parts) await prisma.part.create({ data: part });

  await prisma.discountCode.create({ data: { code: "WELCOME10", description: "First-time customer discount", discountType: "percentage", discountValue: 10, minOrderAmount: 50, active: true } });
  await prisma.discountCode.create({ data: { code: "SHIP25OFF", description: "$25 off any order", discountType: "fixed", discountValue: 25, minOrderAmount: 150, maxUses: 100, active: true } });

  console.log(`Seeded ${phones.length} phones, ${parts.length} parts, 2 discount codes.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
