"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ClaimType = "screen" | "battery" | "camera" | "backGlass";
type ScreenType = "OLED" | "LCD";

const LABELS: Record<ClaimType, string> = {
  screen: "Screen",
  battery: "Battery",
  camera: "Camera",
  backGlass: "Back glass"
};

export default function ClaimForm({
  planId,
  usedClaims
}: {
  planId: number;
  usedClaims: Record<ClaimType, boolean>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [claimType, setClaimType] = useState<ClaimType>("screen");
  const [screenType, setScreenType] = useState<ScreenType>("OLED");
  const [upgradePaid, setUpgradePaid] = useState("");
  const [partCost, setPartCost] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [description, setDescription] = useState("");
  const [performedBy, setPerformedBy] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">+ Log a repair claim</button>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch(`/api/admin/dave-care/${planId}/claims`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        claimType,
        screenType: claimType === "screen" ? screenType : null,
        upgradePaid: upgradePaid ? Number(upgradePaid) : 0,
        partCost: partCost ? Number(partCost) : null,
        laborCost: laborCost ? Number(laborCost) : null,
        description: description || null,
        performedBy: performedBy || null
      })
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not save");
      return;
    }
    setOpen(false);
    setUpgradePaid("");
    setPartCost("");
    setLaborCost("");
    setDescription("");
    setPerformedBy("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-3">
      {error && <div className="rounded-md bg-red-50 border border-red-200 text-red-800 text-xs p-2">{error}</div>}

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Repair type *</label>
          <select className="input" value={claimType} onChange={(e) => setClaimType(e.target.value as ClaimType)} required>
            {(Object.keys(LABELS) as ClaimType[]).map((t) => (
              <option key={t} value={t} disabled={usedClaims[t]}>
                {LABELS[t]} {usedClaims[t] ? "(already claimed)" : ""}
              </option>
            ))}
          </select>
        </div>
        {claimType === "screen" && (
          <div>
            <label className="label">Screen spec *</label>
            <select className="input" value={screenType} onChange={(e) => setScreenType(e.target.value as ScreenType)}>
              <option value="OLED">OLED</option>
              <option value="LCD">LCD</option>
            </select>
          </div>
        )}
        <div>
          <label className="label">
            {claimType === "screen" ? "Upgrade fee customer paid (LCD→OLED, etc)" : "Customer upgrade fee"}
          </label>
          <input className="input" type="number" step="0.01" value={upgradePaid} onChange={(e) => setUpgradePaid(e.target.value)} placeholder="0.00" />
        </div>
        <div>
          <label className="label">Part cost (your cost)</label>
          <input className="input" type="number" step="0.01" value={partCost} onChange={(e) => setPartCost(e.target.value)} placeholder="0.00" />
        </div>
        <div>
          <label className="label">Labor cost</label>
          <input className="input" type="number" step="0.01" value={laborCost} onChange={(e) => setLaborCost(e.target.value)} placeholder="0.00" />
        </div>
        <div>
          <label className="label">Performed by</label>
          <input className="input" value={performedBy} onChange={(e) => setPerformedBy(e.target.value)} placeholder="Dave" />
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea className="input min-h-[60px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Cracked corner-to-corner, customer happy, etc." />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-gray-600 hover:text-gray-900">Cancel</button>
        <button type="submit" disabled={busy} className="btn-primary">{busy ? "Saving…" : "Log claim"}</button>
      </div>
    </form>
  );
}
