"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewRowActions({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function call(action: "hide" | "show" | "delete") {
    if (action === "delete" && !confirm("Delete this review permanently?")) return;
    setBusy(true);
    const method = action === "delete" ? "DELETE" : "PATCH";
    const body = action === "delete" ? undefined : JSON.stringify({ status: action === "hide" ? "hidden" : "approved" });
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      body
    });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      {status === "approved" ? (
        <button onClick={() => call("hide")} disabled={busy} className="text-xs text-gray-600 hover:text-gray-900 underline">Hide</button>
      ) : (
        <button onClick={() => call("show")} disabled={busy} className="text-xs text-brand-700 hover:text-brand-900 underline">Restore</button>
      )}
      <button onClick={() => call("delete")} disabled={busy} className="text-xs text-red-600 hover:text-red-800 underline">Delete</button>
    </div>
  );
}
