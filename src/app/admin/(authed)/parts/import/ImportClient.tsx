"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SAMPLE = `name,category,compatibleWith,brand,price,stock,description
iPhone 15 Pro OEM Screen,screen,iPhone 15 Pro,OEM,229.99,5,Premium replacement display assembly
iPhone 15 Battery,battery,iPhone 15,OEM,49.99,30,Genuine OEM battery
iPhone 15 Pro Max Rear Camera,camera,iPhone 15 Pro Max,OEM,119.99,8,
`;

type ParsedRow = {
  rowNumber: number;
  name: string;
  category: string;
  compatibleWith: string;
  brand: string;
  price: string;
  stock: string;
  imageUrl: string;
  description: string;
  error?: string;
};

const REQUIRED = ["name", "category", "compatibleWith", "price"] as const;

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const delim = lines[0].includes("\t") ? "\t" : ",";
  const header = splitLine(lines[0], delim).map((s) => s.trim());
  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i], delim);
    if (cells.every((c) => !c.trim())) continue;
    const obj: Record<string, string> = {};
    header.forEach((h, j) => (obj[h] = (cells[j] || "").trim()));
    const row: ParsedRow = {
      rowNumber: i + 1,
      name: obj.name || "",
      category: obj.category || "",
      compatibleWith: obj.compatibleWith || obj.compatible_with || obj.compatible || "",
      brand: obj.brand || "",
      price: obj.price || "",
      stock: obj.stock || "0",
      imageUrl: obj.imageUrl || obj.image_url || obj.image || "",
      description: obj.description || ""
    };
    const missing = REQUIRED.filter((k) => !row[k]);
    if (missing.length) row.error = `Missing: ${missing.join(", ")}`;
    else if (!Number.isFinite(Number(row.price))) row.error = "Price must be a number";
    rows.push(row);
  }
  return rows;
}

function splitLine(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQuote = !inQuote; }
    } else if (c === delim && !inQuote) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

export default function ImportClient() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null);

  function preview() {
    setRows(parseCSV(text));
    setResult(null);
  }

  async function importNow() {
    const valid = rows.filter((r) => !r.error);
    if (valid.length === 0) return;
    setBusy(true);
    setResult(null);
    const res = await fetch("/api/admin/parts/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ rows: valid })
    });
    setBusy(false);
    const data = await res.json();
    setResult(data);
    if (data.created > 0) router.refresh();
  }

  const validRows = rows.filter((r) => !r.error);
  const errorRows = rows.filter((r) => r.error);

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <label className="label">CSV or TSV data</label>
        <textarea className="input font-mono text-xs min-h-[260px]" value={text} onChange={(e) => setText(e.target.value)} placeholder={SAMPLE} spellCheck={false} />
        <div className="mt-2 text-xs text-gray-500">
          First row is the header. Columns expected: <code>name, category, compatibleWith, brand, price, stock, imageUrl, description</code>.
          Required: <strong>name, category, compatibleWith, price</strong>.
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={preview} className="btn-secondary" disabled={!text.trim()}>Preview</button>
          <button onClick={() => setText(SAMPLE)} className="btn-secondary">Load sample</button>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <span className="font-semibold text-gray-900">{validRows.length} ready</span>
              {errorRows.length > 0 && <span className="ml-3 text-sm text-red-700">{errorRows.length} with errors</span>}
            </div>
            <button onClick={importNow} disabled={busy || validRows.length === 0} className="btn-primary">
              {busy ? "Importing…" : `Import ${validRows.length} part${validRows.length === 1 ? "" : "s"}`}
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">
              <tr>
                <th className="table-cell">#</th>
                <th className="table-cell">Name</th>
                <th className="table-cell">Category</th>
                <th className="table-cell">Compatible with</th>
                <th className="table-cell text-right">Price</th>
                <th className="table-cell text-right">Stock</th>
                <th className="table-cell">Issue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.rowNumber} className={r.error ? "bg-red-50" : ""}>
                  <td className="table-cell text-gray-500">{r.rowNumber}</td>
                  <td className="table-cell">{r.name}</td>
                  <td className="table-cell">{r.category}</td>
                  <td className="table-cell">{r.compatibleWith}</td>
                  <td className="table-cell text-right">{r.price}</td>
                  <td className="table-cell text-right">{r.stock}</td>
                  <td className="table-cell text-red-700 text-xs">{r.error || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result && (
        <div className={`card p-4 ${result.created > 0 ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
          <p className="font-semibold text-gray-900">Import complete</p>
          <p className="text-sm mt-1">
            Created: <strong>{result.created}</strong> · Skipped: <strong>{result.skipped}</strong>
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 text-xs text-red-700 list-disc list-inside">
              {result.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
