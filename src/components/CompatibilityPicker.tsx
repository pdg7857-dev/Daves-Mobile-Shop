"use client";

import { useMemo, useState } from "react";
import { PHONE_BRANDS } from "@/lib/phone-catalog";

type Props = {
  value: string;
  onChange: (next: string) => void;
};

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function joinList(items: string[]): string {
  return items.join(", ");
}

export default function CompatibilityPicker({ value, onChange }: Props) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");

  const brandObj = useMemo(() => PHONE_BRANDS.find((b) => b.name === brand), [brand]);
  const items = parseList(value);

  function add(modelName: string) {
    const trimmed = modelName.trim();
    if (!trimmed) return;
    if (items.some((i) => i.toLowerCase() === trimmed.toLowerCase())) return;
    onChange(joinList([...items, trimmed]));
  }

  function removeAt(i: number) {
    const next = items.slice();
    next.splice(i, 1);
    onChange(joinList(next));
  }

  function addFromPicker() {
    if (!model) return;
    add(model);
    setModel("");
  }

  return (
    <div>
      <label className="label">Compatible with *</label>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {items.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-2.5 py-1 text-xs text-brand-800"
            >
              {item}
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="text-brand-600 hover:text-brand-900"
                aria-label={`Remove ${item}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="grid sm:grid-cols-[1fr_2fr_auto] gap-2">
        <select
          className="input"
          value={brand}
          onChange={(e) => {
            setBrand(e.target.value);
            setModel("");
          }}
        >
          <option value="">Brand…</option>
          {PHONE_BRANDS.map((b) => (
            <option key={b.slug} value={b.name}>{b.name}</option>
          ))}
        </select>
        <select
          className="input"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={!brandObj}
        >
          <option value="">{brandObj ? "Model…" : "Pick brand first"}</option>
          {brandObj?.models.map((m) => (
            <option key={m.slug} value={m.name}>{m.name}</option>
          ))}
        </select>
        <button
          type="button"
          className="btn-secondary"
          onClick={addFromPicker}
          disabled={!model}
        >
          Add
        </button>
      </div>

      <input
        className="input mt-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="iPhone 14, iPhone 14 Plus"
        required
      />
      <p className="text-xs text-gray-500 mt-1">
        Pick devices above to add as chips, or type a comma-separated list directly.
      </p>
    </div>
  );
}
