import { syncAll } from "../src/lib/sync";

(async () => {
  const report = await syncAll();
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.mobileShop.ok && report.toyota.ok ? 0 : 1);
})();
