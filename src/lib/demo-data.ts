/**
 * Demo data definition + idempotent populator.
 *
 * Used by:
 *  - `npm run db:demo`               (CLI wrapper in prisma/demo-data.ts)
 *  - POST /api/admin/demo-data       (one-click button on /admin/dashboard)
 *
 * Idempotent: skips by IMEI for phones and (name + compatibleWith) for parts.
 * All demo rows carry a "DEMO-" prefix on IMEI / serial / supplier name so
 * they're easy to filter out later.
 */
import type { PrismaClient } from "@prisma/client";

type DemoPhone = {
  brand: string;
  model: string;
  storage: string;
  color: string;
  condition: string;
  imei: string;
  serial: string;
  purchasePrice: number;
  askingPrice: number;
  status: string;
  purchaseDaysAgo: number;
  city: string;
  notes?: string;
  repairNeeded?: string;
};

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export const DEMO_PHONES: DemoPhone[] = [
  // Apple — recent flagships
  { brand: "Apple", model: "iPhone 16 Pro Max", storage: "512GB", color: "Natural Titanium", condition: "Like New", imei: "DEMO-356001000000001", serial: "DEMO-FK7C001", purchasePrice: 1100, askingPrice: 1499, status: "for_sale", purchaseDaysAgo: 4, city: "gta", notes: "Mint condition. Original box included." },
  { brand: "Apple", model: "iPhone 16 Pro", storage: "256GB", color: "Desert Titanium", condition: "Like New", imei: "DEMO-356001000000002", serial: "DEMO-FK7C002", purchasePrice: 900, askingPrice: 1199, status: "for_sale", purchaseDaysAgo: 6, city: "montreal" },
  { brand: "Apple", model: "iPhone 16", storage: "128GB", color: "Ultramarine", condition: "Like New", imei: "DEMO-356001000000003", serial: "DEMO-FK7C003", purchasePrice: 650, askingPrice: 899, status: "for_sale", purchaseDaysAgo: 8, city: "ottawa" },
  { brand: "Apple", model: "iPhone 15 Pro", storage: "256GB", color: "Blue Titanium", condition: "Like New", imei: "DEMO-356001000000004", serial: "DEMO-FK7C004", purchasePrice: 800, askingPrice: 1099, status: "for_sale", purchaseDaysAgo: 12, city: "gta", notes: "Battery health 98%." },
  { brand: "Apple", model: "iPhone 15", storage: "128GB", color: "Pink", condition: "Good", imei: "DEMO-356001000000005", serial: "DEMO-FK7C005", purchasePrice: 550, askingPrice: 779, status: "for_sale", purchaseDaysAgo: 15, city: "halifax" },
  { brand: "Apple", model: "iPhone 14 Pro Max", storage: "256GB", color: "Deep Purple", condition: "Good", imei: "DEMO-356001000000006", serial: "DEMO-FK7C006", purchasePrice: 620, askingPrice: 899, status: "for_sale", purchaseDaysAgo: 20, city: "quebec-city", notes: "Battery health 89%." },
  { brand: "Apple", model: "iPhone 14", storage: "128GB", color: "Midnight", condition: "Good", imei: "DEMO-356001000000007", serial: "DEMO-FK7C007", purchasePrice: 430, askingPrice: 649, status: "for_sale", purchaseDaysAgo: 22, city: "moncton" },
  { brand: "Apple", model: "iPhone 13 Pro", storage: "256GB", color: "Sierra Blue", condition: "Like New", imei: "DEMO-356001000000008", serial: "DEMO-FK7C008", purchasePrice: 480, askingPrice: 699, status: "for_sale", purchaseDaysAgo: 25, city: "gta", notes: "New OEM screen installed last month." },
  { brand: "Apple", model: "iPhone 13", storage: "128GB", color: "Starlight", condition: "Good", imei: "DEMO-356001000000009", serial: "DEMO-FK7C009", purchasePrice: 350, askingPrice: 549, status: "for_sale", purchaseDaysAgo: 28, city: "montreal" },
  { brand: "Apple", model: "iPhone 13 mini", storage: "128GB", color: "Green", condition: "Good", imei: "DEMO-356001000000010", serial: "DEMO-FK7C010", purchasePrice: 280, askingPrice: 449, status: "for_sale", purchaseDaysAgo: 30, city: "halifax", notes: "Rare mini form factor." },
  { brand: "Apple", model: "iPhone 12 Pro", storage: "128GB", color: "Pacific Blue", condition: "Good", imei: "DEMO-356001000000011", serial: "DEMO-FK7C011", purchasePrice: 320, askingPrice: 499, status: "for_sale", purchaseDaysAgo: 32, city: "ottawa" },
  { brand: "Apple", model: "iPhone 12", storage: "64GB", color: "White", condition: "Fair", imei: "DEMO-356001000000012", serial: "DEMO-FK7C012", purchasePrice: 200, askingPrice: 329, status: "for_sale", purchaseDaysAgo: 35, city: "quebec-city", notes: "Light wear on housing. Battery replaced." },
  { brand: "Apple", model: "iPhone 11 Pro Max", storage: "256GB", color: "Midnight Green", condition: "Good", imei: "DEMO-356001000000013", serial: "DEMO-FK7C013", purchasePrice: 270, askingPrice: 439, status: "for_sale", purchaseDaysAgo: 38, city: "gta" },
  { brand: "Apple", model: "iPhone 11", storage: "128GB", color: "Black", condition: "Good", imei: "DEMO-356001000000014", serial: "DEMO-FK7C014", purchasePrice: 170, askingPrice: 289, status: "for_sale", purchaseDaysAgo: 40, city: "moncton" },
  { brand: "Apple", model: "iPhone SE (2022)", storage: "128GB", color: "Midnight", condition: "Like New", imei: "DEMO-356001000000015", serial: "DEMO-FK7C015", purchasePrice: 220, askingPrice: 329, status: "for_sale", purchaseDaysAgo: 7, city: "montreal", notes: "Great budget option with Touch ID." },

  // Samsung
  { brand: "Samsung", model: "Galaxy S25 Ultra", storage: "512GB", color: "Titanium Silverblue", condition: "Like New", imei: "DEMO-356002000000001", serial: "DEMO-RZ8N001", purchasePrice: 1050, askingPrice: 1449, status: "for_sale", purchaseDaysAgo: 5, city: "gta" },
  { brand: "Samsung", model: "Galaxy S24 Ultra", storage: "256GB", color: "Titanium Gray", condition: "Like New", imei: "DEMO-356002000000002", serial: "DEMO-RZ8N002", purchasePrice: 850, askingPrice: 1199, status: "for_sale", purchaseDaysAgo: 10, city: "montreal", notes: "S-Pen included." },
  { brand: "Samsung", model: "Galaxy S24", storage: "256GB", color: "Cobalt Violet", condition: "Good", imei: "DEMO-356002000000003", serial: "DEMO-RZ8N003", purchasePrice: 580, askingPrice: 799, status: "for_sale", purchaseDaysAgo: 14, city: "ottawa" },
  { brand: "Samsung", model: "Galaxy S23 Ultra", storage: "512GB", color: "Phantom Black", condition: "Good", imei: "DEMO-356002000000004", serial: "DEMO-RZ8N004", purchasePrice: 650, askingPrice: 899, status: "for_sale", purchaseDaysAgo: 18, city: "halifax" },
  { brand: "Samsung", model: "Galaxy S23", storage: "128GB", color: "Cream", condition: "Good", imei: "DEMO-356002000000005", serial: "DEMO-RZ8N005", purchasePrice: 400, askingPrice: 599, status: "for_sale", purchaseDaysAgo: 22, city: "quebec-city" },
  { brand: "Samsung", model: "Galaxy S22", storage: "128GB", color: "Phantom Black", condition: "Good", imei: "DEMO-356002000000006", serial: "DEMO-RZ8N006", purchasePrice: 320, askingPrice: 479, status: "for_sale", purchaseDaysAgo: 26, city: "gta" },
  { brand: "Samsung", model: "Galaxy Z Flip6", storage: "256GB", color: "Mint", condition: "Like New", imei: "DEMO-356002000000007", serial: "DEMO-RZ8N007", purchasePrice: 750, askingPrice: 1049, status: "for_sale", purchaseDaysAgo: 9, city: "montreal", notes: "Foldable. Mint hinge condition." },
  { brand: "Samsung", model: "Galaxy A54", storage: "128GB", color: "Awesome Violet", condition: "Good", imei: "DEMO-356002000000008", serial: "DEMO-RZ8N008", purchasePrice: 220, askingPrice: 349, status: "for_sale", purchaseDaysAgo: 33, city: "moncton" },

  // Google
  { brand: "Google", model: "Pixel 9 Pro XL", storage: "256GB", color: "Obsidian", condition: "Like New", imei: "DEMO-356003000000001", serial: "DEMO-GPX9-001", purchasePrice: 850, askingPrice: 1199, status: "for_sale", purchaseDaysAgo: 11, city: "gta" },
  { brand: "Google", model: "Pixel 9", storage: "128GB", color: "Peony", condition: "Like New", imei: "DEMO-356003000000002", serial: "DEMO-GPX9-002", purchasePrice: 550, askingPrice: 799, status: "for_sale", purchaseDaysAgo: 16, city: "ottawa" },
  { brand: "Google", model: "Pixel 8 Pro", storage: "256GB", color: "Bay", condition: "Good", imei: "DEMO-356003000000003", serial: "DEMO-GPX8-001", purchasePrice: 580, askingPrice: 849, status: "for_sale", purchaseDaysAgo: 21, city: "montreal" },
  { brand: "Google", model: "Pixel 8", storage: "128GB", color: "Hazel", condition: "Good", imei: "DEMO-356003000000004", serial: "DEMO-GPX8-002", purchasePrice: 380, askingPrice: 579, status: "for_sale", purchaseDaysAgo: 27, city: "halifax" },
  { brand: "Google", model: "Pixel 7a", storage: "128GB", color: "Sea", condition: "Good", imei: "DEMO-356003000000005", serial: "DEMO-GPX7A-001", purchasePrice: 240, askingPrice: 379, status: "for_sale", purchaseDaysAgo: 31, city: "quebec-city", notes: "Great mid-range. Strong cameras." },

  // A few non-for_sale to demo other statuses
  { brand: "Apple", model: "iPhone 14 Pro", storage: "128GB", color: "Space Black", condition: "Good", imei: "DEMO-356099000000001", serial: "DEMO-FK7C099A", purchasePrice: 500, askingPrice: 799, status: "in_repair", purchaseDaysAgo: 2, city: "gta", repairNeeded: "Back glass + battery" },
  { brand: "Apple", model: "iPhone 15 Plus", storage: "256GB", color: "Blue", condition: "Like New", imei: "DEMO-356099000000002", serial: "DEMO-FK7C099B", purchasePrice: 700, askingPrice: 999, status: "reserved", purchaseDaysAgo: 3, city: "montreal", notes: "Hold for J. Tremblay until Friday." }
];

type DemoPart = {
  name: string;
  category: string;
  compatibleWith: string;
  brand: string;
  price: number;
  stock: number;
  description?: string;
};

export const DEMO_PARTS: DemoPart[] = [
  { name: "iPhone 16 Pro Max OEM Display", category: "screen", compatibleWith: "iPhone 16 Pro Max", brand: "OEM", price: 329.99, stock: 4, description: "Brand-new OEM Pro Max display assembly with ProMotion." },
  { name: "iPhone 16 Pro OEM Display", category: "screen", compatibleWith: "iPhone 16 Pro", brand: "OEM", price: 299.99, stock: 6 },
  { name: "iPhone 15 Pro Max OEM Display", category: "screen", compatibleWith: "iPhone 15 Pro Max", brand: "OEM", price: 279.99, stock: 5 },
  { name: "Galaxy S24 Ultra AMOLED Assembly", category: "screen", compatibleWith: "Galaxy S24 Ultra", brand: "OEM", price: 319.99, stock: 3 },
  { name: "Galaxy S23 Ultra AMOLED Assembly", category: "screen", compatibleWith: "Galaxy S23 Ultra", brand: "OEM", price: 269.99, stock: 4 },
  { name: "Pixel 9 Pro OLED Assembly", category: "screen", compatibleWith: "Pixel 9 Pro", brand: "OEM", price: 249.99, stock: 3 },
  { name: "iPhone 16 Pro Max Battery", category: "battery", compatibleWith: "iPhone 16 Pro Max", brand: "OEM", price: 79.99, stock: 15 },
  { name: "Galaxy S24 Ultra Battery", category: "battery", compatibleWith: "Galaxy S24 Ultra", brand: "OEM", price: 69.99, stock: 12 },
  { name: "Pixel 8 Pro Battery", category: "battery", compatibleWith: "Pixel 8 Pro", brand: "OEM", price: 59.99, stock: 10 },
  { name: "iPhone 16 Pro Tetraprism Telephoto Module", category: "camera", compatibleWith: "iPhone 16 Pro, iPhone 16 Pro Max", brand: "OEM", price: 149.99, stock: 4 },
  { name: "Galaxy S24 Ultra 200MP Wide Camera", category: "camera", compatibleWith: "Galaxy S24 Ultra", brand: "OEM", price: 129.99, stock: 3 },
  { name: "Pixel 9 Pro Camera Bar Assembly", category: "camera", compatibleWith: "Pixel 9 Pro, Pixel 9 Pro XL", brand: "OEM", price: 119.99, stock: 4 },
  { name: "USB-C Charging Port Flex (iPhone 15/16)", category: "charging-port", compatibleWith: "iPhone 15, iPhone 15 Plus, iPhone 15 Pro, iPhone 15 Pro Max, iPhone 16, iPhone 16 Plus, iPhone 16 Pro, iPhone 16 Pro Max", brand: "OEM", price: 39.99, stock: 18 },
  { name: "Samsung USB-C Port (S22/S23/S24)", category: "charging-port", compatibleWith: "Galaxy S22, Galaxy S23, Galaxy S24, S22+, S23+, S24+", brand: "OEM", price: 34.99, stock: 14 },
  { name: "iPhone 15 Pro Titanium Frame", category: "housing", compatibleWith: "iPhone 15 Pro", brand: "OEM", price: 89.99, stock: 4 },
  { name: "Galaxy Z Flip6 Inner Hinge Cover", category: "housing", compatibleWith: "Galaxy Z Flip6", brand: "OEM", price: 49.99, stock: 6 },
  { name: "iPhone 16 Pro Camera Control Button Assembly", category: "buttons", compatibleWith: "iPhone 16 Pro, iPhone 16 Pro Max", brand: "OEM", price: 39.99, stock: 8 },
  { name: "iPhone Power & Volume Button Flex (14/15)", category: "buttons", compatibleWith: "iPhone 14, iPhone 15", brand: "OEM", price: 19.99, stock: 20 },
  { name: "iPhone Loudspeaker Module (15/16 universal)", category: "speaker", compatibleWith: "iPhone 15 series, iPhone 16 series", brand: "OEM", price: 22.99, stock: 25 },
  { name: "MagSafe-Compatible Wireless Charger 15W", category: "accessory", compatibleWith: "iPhone 12 and newer", brand: "Aftermarket", price: 29.99, stock: 40, description: "Faster than Qi. Strong magnetic alignment." },
  { name: "USB-C 35W Dual-Port Power Adapter", category: "accessory", compatibleWith: "All USB-C devices", brand: "Aftermarket", price: 34.99, stock: 30 },
  { name: "Premium Tempered Glass — iPhone 16 Pro", category: "accessory", compatibleWith: "iPhone 16 Pro", brand: "Aftermarket", price: 14.99, stock: 80 },
  { name: "Premium Tempered Glass — Galaxy S24 Ultra", category: "accessory", compatibleWith: "Galaxy S24 Ultra", brand: "Aftermarket", price: 14.99, stock: 60 },
  { name: "Leather MagSafe Wallet", category: "accessory", compatibleWith: "iPhone 12 and newer", brand: "Aftermarket", price: 39.99, stock: 25 },

  // Frequently-bought-together accessories
  { name: "Apple 20W USB-C Power Adapter", category: "accessory", compatibleWith: "iPhone 12 and newer, all USB-C devices", brand: "Apple OEM", price: 24.99, stock: 100, description: "Official Apple charging block. Fast-charges iPhone to 50% in ~30 min." },
  { name: "Apple 35W Dual USB-C Power Adapter", category: "accessory", compatibleWith: "iPhone 12 and newer, MacBook, iPad", brand: "Apple OEM", price: 65.00, stock: 40, description: "Two ports, fast-charges two devices at once." },
  { name: "Apple USB-C to Lightning Cable (1m)", category: "accessory", compatibleWith: "iPhone 11–14 series", brand: "Apple OEM", price: 24.99, stock: 80 },
  { name: "Apple USB-C to USB-C Cable (1m)", category: "accessory", compatibleWith: "iPhone 15+, all USB-C devices", brand: "Apple OEM", price: 24.99, stock: 80 },
  { name: "Apple USB-C to USB-C Cable (2m)", category: "accessory", compatibleWith: "iPhone 15+, all USB-C devices", brand: "Apple OEM", price: 34.99, stock: 50 },
  { name: "Apple MagSafe Charger (1m)", category: "accessory", compatibleWith: "iPhone 12 and newer", brand: "Apple OEM", price: 59.00, stock: 35, description: "Snaps magnetically, charges up to 15W." },
  { name: "Apple AirPods Pro (2nd gen) USB-C", category: "accessory", compatibleWith: "All iPhones", brand: "Apple OEM", price: 329.00, stock: 12, description: "Active Noise Cancellation, Adaptive Audio, USB-C charging." },
  { name: "Apple Watch USB-C Magnetic Charging Cable", category: "accessory", compatibleWith: "All Apple Watch models", brand: "Apple OEM", price: 35.00, stock: 30 },

  // Universal accessories
  { name: "Anker 65W GaN Wall Charger (3-Port)", category: "accessory", compatibleWith: "All USB-C and USB-A devices", brand: "Anker", price: 54.99, stock: 25, description: "Powerful enough for a MacBook + phone + tablet from one outlet." },
  { name: "Anker PowerCore 20K Power Bank", category: "accessory", compatibleWith: "All USB-C and USB-A devices", brand: "Anker", price: 79.99, stock: 30, description: "Charges an iPhone 16 ~5 times on a single charge." },
  { name: "Belkin BoostCharge 3-in-1 MagSafe Stand", category: "accessory", compatibleWith: "iPhone 12+, Apple Watch, AirPods", brand: "Belkin", price: 139.99, stock: 15, description: "Charges your iPhone, Watch and AirPods from one base." },
  { name: "Mophie Snap+ Magnetic Wireless Powerstation", category: "accessory", compatibleWith: "iPhone 12+", brand: "Mophie", price: 89.99, stock: 18 },
  { name: "Samsung 45W USB-C Travel Adapter", category: "accessory", compatibleWith: "Galaxy S22+, S23+, S24, S25 series", brand: "Samsung OEM", price: 49.99, stock: 35 },
  { name: "Google Pixel 30W USB-C Charger", category: "accessory", compatibleWith: "Pixel 6 and newer", brand: "Google OEM", price: 35.99, stock: 25 },

  // Cases — universal popular models
  { name: "Apple iPhone 16 Pro Silicone Case with MagSafe", category: "accessory", compatibleWith: "iPhone 16 Pro", brand: "Apple OEM", price: 59.00, stock: 30 },
  { name: "Apple iPhone 16 Pro Max Silicone Case with MagSafe", category: "accessory", compatibleWith: "iPhone 16 Pro Max", brand: "Apple OEM", price: 59.00, stock: 30 },
  { name: "Apple iPhone 15 Pro Silicone Case with MagSafe", category: "accessory", compatibleWith: "iPhone 15 Pro", brand: "Apple OEM", price: 59.00, stock: 25 },
  { name: "Spigen Tough Armor Case — iPhone 16 Pro", category: "accessory", compatibleWith: "iPhone 16 Pro", brand: "Spigen", price: 39.99, stock: 40, description: "Drop-tested to military spec. Built-in kickstand." },
  { name: "Spigen Tough Armor Case — Galaxy S24 Ultra", category: "accessory", compatibleWith: "Galaxy S24 Ultra", brand: "Spigen", price: 39.99, stock: 30 },
  { name: "OtterBox Defender Series — iPhone 15 Pro", category: "accessory", compatibleWith: "iPhone 15 Pro", brand: "OtterBox", price: 89.99, stock: 18 },

  // Audio
  { name: "Apple EarPods (USB-C)", category: "accessory", compatibleWith: "iPhone 15+, USB-C devices", brand: "Apple OEM", price: 25.00, stock: 45 },
  { name: "Samsung Galaxy Buds3 Pro", category: "accessory", compatibleWith: "All Bluetooth devices", brand: "Samsung OEM", price: 329.99, stock: 10 },

  // Misc
  { name: "Apple AirTag (4-pack)", category: "accessory", compatibleWith: "iPhone 11 and newer", brand: "Apple OEM", price: 129.00, stock: 25, description: "Find your keys, wallet, bag. Works with Find My." },
  { name: "Apple AirTag (single)", category: "accessory", compatibleWith: "iPhone 11 and newer", brand: "Apple OEM", price: 39.00, stock: 50 },
  { name: "SanDisk 128GB iXpand Flash Drive (USB-C + Lightning)", category: "accessory", compatibleWith: "All iPhones", brand: "SanDisk", price: 59.99, stock: 20 },

  // Tools & equipment
  { name: "Pro Heat Mat (W/ Temperature Control)", category: "tool", compatibleWith: "Universal", brand: "iFixit-style", price: 89.99, stock: 12, description: "Even heat distribution. Adjustable 60-110°C." },
  { name: "Suction Cup with Handle", category: "tool", compatibleWith: "Universal", brand: "OEM-style", price: 6.99, stock: 50 },
  { name: "Plastic Opening Pick Set (100 pcs)", category: "tool", compatibleWith: "Universal", brand: "OEM-style", price: 12.99, stock: 40 },
  { name: "Spudger Set (5 pcs)", category: "tool", compatibleWith: "Universal", brand: "OEM-style", price: 14.99, stock: 35 },
  { name: "Precision Screwdriver Kit (115-in-1)", category: "tool", compatibleWith: "Universal", brand: "OEM-style", price: 49.99, stock: 22, description: "Pentalobe, tri-point, Torx and Phillips bits. Magnetic." },
  { name: "Tri-Point Y000 Screwdriver", category: "tool", compatibleWith: "iPhone 7 and newer", brand: "OEM-style", price: 9.99, stock: 60 },
  { name: "Pentalobe P2 Screwdriver", category: "tool", compatibleWith: "All iPhones", brand: "OEM-style", price: 8.99, stock: 65 },
  { name: "Anti-Static Wrist Strap", category: "equipment", compatibleWith: "Universal", brand: "OEM-style", price: 7.99, stock: 80 },
  { name: "ESD Magnetic Project Mat", category: "equipment", compatibleWith: "Universal", brand: "OEM-style", price: 34.99, stock: 18, description: "Numbered grid + magnetic so screws don't roll away." },
  { name: "UV Curing Lamp (10W)", category: "equipment", compatibleWith: "Back glass / loca repair", brand: "OEM-style", price: 39.99, stock: 14 },
  { name: "Hot Air Rework Station", category: "equipment", compatibleWith: "Board-level repair", brand: "OEM-style", price: 149.99, stock: 6, description: "Variable temp + airflow for soldering and component removal." },
  { name: "Microscope (7-45x, Stand-Mounted)", category: "equipment", compatibleWith: "Board-level repair", brand: "OEM-style", price: 229.99, stock: 4 }
];

export type DemoResult = {
  phonesAdded: number;
  phonesSkipped: number;
  partsAdded: number;
  partsSkipped: number;
  supplierCreated: boolean;
  settingsCreated: boolean;
};

export async function populateDemoData(prisma: PrismaClient): Promise<DemoResult> {
  let settingsCreated = false;
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!settings) {
    await prisma.settings.create({
      data: { id: 1, shippingFlatRate: 15, freeShippingThreshold: 200 }
    });
    settingsCreated = true;
  }

  let supplierCreated = false;
  let supplier = await prisma.supplier.findFirst({ where: { name: "Demo Wholesaler" } });
  if (!supplier) {
    supplier = await prisma.supplier.create({
      data: { name: "Demo Wholesaler", contact: "demo@example.com", notes: "Auto-created by demo-data. Safe to delete." }
    });
    supplierCreated = true;
  }

  let phonesAdded = 0;
  let phonesSkipped = 0;
  for (const p of DEMO_PHONES) {
    const existing = await prisma.phone.findUnique({ where: { imei: p.imei } });
    if (existing) {
      phonesSkipped++;
      continue;
    }
    await prisma.phone.create({
      data: {
        brand: p.brand,
        model: p.model,
        storage: p.storage,
        color: p.color,
        condition: p.condition,
        imei: p.imei,
        serial: p.serial,
        purchasePrice: p.purchasePrice,
        askingPrice: p.askingPrice,
        status: p.status,
        purchaseDate: daysAgo(p.purchaseDaysAgo),
        supplierId: supplier.id,
        notes: p.notes,
        repairNeeded: p.repairNeeded,
        city: p.city
      }
    });
    phonesAdded++;
  }

  let partsAdded = 0;
  let partsSkipped = 0;
  for (const part of DEMO_PARTS) {
    const existing = await prisma.part.findFirst({
      where: { name: part.name, compatibleWith: part.compatibleWith }
    });
    if (existing) {
      partsSkipped++;
      continue;
    }
    await prisma.part.create({ data: part });
    partsAdded++;
  }

  return { phonesAdded, phonesSkipped, partsAdded, partsSkipped, supplierCreated, settingsCreated };
}
