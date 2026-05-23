"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Result = {
  phonesAdded: number;
  phonesSkipped: number;
  partsAdded: number;
  partsSkipped: number;
};

export default function DemoDataButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!confirm("Add 30 demo phones + 24 demo parts to your database?\n\nThey're marked with DEMO- prefixes and skipped on re-run. Won't touch real records.")) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/demo-data", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Request failed (${res.status})`);
      } else {
        setResult(await res.json());
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={run} disabled={busy} className="btn-secondary">
        {busy ? "Loading…" : "Load demo data"}
      </button>
      {result && (
        <p className="text-xs text-gray-600">
          Added <strong>{result.phonesAdded}</strong> phones, <strong>{result.partsAdded}</strong> parts
          {(result.phonesSkipped + result.partsSkipped) > 0 && (
            <> · skipped {result.phonesSkipped + result.partsSkipped} already present</>
          )}
        </p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
