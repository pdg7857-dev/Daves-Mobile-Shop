import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.repair.deleteMany();
  await prisma.phone.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.part.deleteMany();

  const wholesaler = await prisma.supplier.create({
    data: {
      name: "MobileWholesale Canada",
      contact: "orders@mobilewholesale.ca",
      notes: "Bulk lot supplier — net 30 terms"
    }
  });

  const tradeIn = await prisma.supplier.create({
    data: {
      name: "Customer trade-in",
      notes: "Walk-in customer trade-ins and buybacks"
    }
  });

  const phones = [
    {
      brand: "Apple",
      model: "iPhone 13 Pro",
      storage: "128GB",
      color: "Sierra Blue",
      condition: "Like New",
      imei: "356789012345671",
      serial: "FK7CD3X1N9",
      purchasePrice: 420,
      askingPrice: 599,
      status: "for_sale",
      purchaseDate: new Date("2026-04-10"),
      supplierId: wholesaler.id,
      city: "gta",
      notes: "Battery health 92%. New OEM screen installed."
    },
    {
      brand: "Apple",
      model: "iPhone 14",
      storage: "256GB",
      color: "Midnight",
      condition: "Good",
      imei: "356789012345672",
      serial: "FK7CD3X1N0",
      purchasePrice: 480,
      askingPrice: 679,
      status: "for_sale",
      purchaseDate: new Date("2026-04-22"),
      supplierId: tradeIn.id,
      city: "montreal",
      notes: "Minor scuff on bottom edge."
    },
    {
      brand: "Samsung",
      model: "Galaxy S22",
      storage: "128GB",
      color: "Phantom Black",
      condition: "Good",
      imei: "356789012345673",
      serial: "RZ8N20XYAB",
      purchasePrice: 280,
      askingPrice: 449,
      status: "for_sale",
      purchaseDate: new Date("2026-04-30"),
      supplierId: wholesaler.id,
      city: "ottawa"
    },
    {
      brand: "Google",
      model: "Pixel 7",
      storage: "128GB",
      color: "Obsidian",
      condition: "Good",
      imei: "356789012345674",
      serial: "GPX7-001",
      purchasePrice: 240,
      askingPrice: 379,
      status: "for_sale",
      purchaseDate: new Date("2026-05-02"),
      supplierId: wholesaler.id,
      city: "halifax"
    },
    {
      brand: "Apple",
      model: "iPhone 12",
      storage: "64GB",
      color: "White",
      condition: "Fair",
      imei: "356789012345675",
      serial: "FK7CD3X1N2",
      purchasePrice: 200,
      askingPrice: 329,
      status: "for_sale",
      purchaseDate: new Date("2026-05-05"),
      supplierId: tradeIn.id,
      city: "quebec-city",
      notes: "Battery replaced. Light wear on housing."
    },
    {
      brand: "Apple",
      model: "iPhone 11",
      storage: "64GB",
      color: "Black",
      condition: "Good",
      imei: "356789012345676",
      serial: "FK7CD3X1N3",
      purchasePrice: 150,
      askingPrice: 259,
      status: "for_sale",
      purchaseDate: new Date("2026-05-10"),
      supplierId: tradeIn.id,
      city: "moncton"
    }
  ];

  for (const p of phones) {
    const created = await prisma.phone.create({ data: p });
    if (p.notes?.includes("screen")) {
      await prisma.repair.create({
        data: {
          phoneId: created.id,
          serviceType: "screen",
          description: "Replaced cracked OEM screen with new OEM display assembly",
          partCost: 120,
          laborCost: 40,
          performedBy: "Dave"
        }
      });
    }
    if (p.notes?.includes("Battery replaced")) {
      await prisma.repair.create({
        data: {
          phoneId: created.id,
          serviceType: "battery",
          description: "Replaced battery — original health 71%, new battery installed",
          partCost: 25,
          laborCost: 30,
          performedBy: "Dave"
        }
      });
    }
  }

  const parts = [
    { name: "iPhone 13 / 13 Pro OEM Screen Assembly", category: "screen", compatibleWith: "iPhone 13, iPhone 13 Pro", brand: "OEM", price: 149.99, stock: 12 },
    { name: "iPhone 14 Pro OLED Screen", category: "screen", compatibleWith: "iPhone 14 Pro", brand: "OEM", price: 219.99, stock: 6 },
    { name: "Samsung Galaxy S22 AMOLED Display", category: "screen", compatibleWith: "Galaxy S22", brand: "OEM", price: 189.99, stock: 4 },
    { name: "Pixel 7 Replacement Display", category: "screen", compatibleWith: "Pixel 7", brand: "Aftermarket", price: 109.99, stock: 8 },
    { name: "iPhone 12 Battery", category: "battery", compatibleWith: "iPhone 12, iPhone 12 Pro", brand: "OEM", price: 39.99, stock: 25 },
    { name: "iPhone 13 Battery", category: "battery", compatibleWith: "iPhone 13", brand: "OEM", price: 44.99, stock: 22 },
    { name: "Galaxy S22 Battery", category: "battery", compatibleWith: "Galaxy S22", brand: "OEM", price: 34.99, stock: 18 },
    { name: "iPhone 13 Pro Rear Camera Module", category: "camera", compatibleWith: "iPhone 13 Pro", brand: "OEM", price: 89.99, stock: 5 },
    { name: "iPhone 14 Back Glass Housing", category: "housing", compatibleWith: "iPhone 14", brand: "OEM", price: 59.99, stock: 10 },
    { name: "iPhone 13 Lightning Charging Port Flex", category: "charging-port", compatibleWith: "iPhone 13", brand: "OEM", price: 24.99, stock: 30 },
    { name: "USB-C Charging Port (Galaxy S Series)", category: "charging-port", compatibleWith: "Galaxy S20, S21, S22", brand: "OEM", price: 19.99, stock: 25 },
    { name: "iPhone Earpiece Speaker", category: "speaker", compatibleWith: "iPhone 11, 12, 13, 14", brand: "OEM", price: 14.99, stock: 40 },
    { name: "Tempered Glass Screen Protector (Universal)", category: "accessory", compatibleWith: "iPhone 11 through iPhone 15", brand: "Aftermarket", price: 9.99, stock: 100 },
    { name: "20W USB-C Power Adapter", category: "accessory", compatibleWith: "All USB-C devices", brand: "Aftermarket", price: 19.99, stock: 60 }
  ];

  for (const part of parts) {
    await prisma.part.create({ data: part });
  }

  console.log(`Seeded ${phones.length} phones and ${parts.length} parts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
