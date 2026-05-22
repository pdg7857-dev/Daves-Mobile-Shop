import Link from "next/link";
import ImportClient from "./ImportClient";

export const metadata = { title: "Bulk import parts" };

export default function PartsImportPage() {
  return (
    <div>
      <Link href="/admin/parts" className="text-sm text-brand-700">← Back to parts</Link>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">Bulk import parts</h1>
      <p className="text-sm text-gray-600 mb-6">
        Paste a CSV or TSV (the format Excel / Google Sheets exports) to bulk-add parts. Useful for importing
        a wholesale supplier&apos;s catalogue.
      </p>
      <ImportClient />
    </div>
  );
}
