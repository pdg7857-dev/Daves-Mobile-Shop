/**
 * CLI wrapper around src/lib/demo-data. Run via: npm run db:demo
 *
 * Idempotent: safe to run multiple times, safe to run against a DB
 * that already has real production data — only adds rows whose
 * IMEI / part name don't already exist.
 */
import { PrismaClient } from "@prisma/client";
import { populateDemoData } from "../src/lib/demo-data";

const prisma = new PrismaClient();

async function main() {
  const result = await populateDemoData(prisma);
  if (result.settingsCreated) console.log("• Created default Settings row");
  if (result.supplierCreated) console.log("• Created Demo Wholesaler supplier");
  console.log(`\n✓ Demo data loaded`);
  console.log(`  Phones — added ${result.phonesAdded}, skipped ${result.phonesSkipped} already present`);
  console.log(`  Parts  — added ${result.partsAdded}, skipped ${result.partsSkipped} already present`);
  console.log(`\nAll demo records carry the "DEMO-" prefix on IMEI / serial / supplier name.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
