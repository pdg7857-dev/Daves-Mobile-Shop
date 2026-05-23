"use client";

import { useState, useTransition } from "react";
import { runSyncNow } from "@/app/actions";
import type { SyncAllReport } from "@/lib/sync";

export function SyncButton() {
  const [pending, start] = useTransition();
  const [report, setReport] = useState<SyncAllReport | null>(null);

  return (
    <div className="flex items-center gap-3">
      <button
        className="btn-primary"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await runSyncNow();
            setReport(r);
          })
        }
      >
        {pending ? "Syncing..." : "Sync now"}
      </button>
      {report && (
        <span className="text-xs text-sub">
          {report.mobileShop.ok
            ? `Shop +${report.mobileShop.result?.added}/~${report.mobileShop.result?.updated}/✓${report.mobileShop.result?.closed}`
            : `Shop: ${report.mobileShop.error}`}
          {" · "}
          {report.toyota.ok
            ? `Toyota +${report.toyota.result?.added}/~${report.toyota.result?.updated}/✓${report.toyota.result?.closed}`
            : `Toyota: ${report.toyota.error}`}
          {" · "}
          Recurring +{report.recurringSpawned}
        </span>
      )}
    </div>
  );
}
