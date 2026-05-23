"use client";

import { PHONE_BRANDS, OTHER_BRAND, findBrand, findModel } from "@/lib/phone-catalog";

type Props = {
  brand: string;
  model: string;
  storage: string;
  color: string;
  onChange: (next: { brand: string; model: string; storage: string; color: string }) => void;
  requireBrandModel?: boolean;
};

const OTHER = "__other__";

export default function DevicePicker({
  brand,
  model,
  storage,
  color,
  onChange,
  requireBrandModel = true
}: Props) {
  const matchedBrand = findBrand(brand);
  const brandIsKnown = !!matchedBrand;
  const brandSelectValue = brandIsKnown ? matchedBrand!.name : brand ? OTHER : "";

  const matchedModel = findModel(matchedBrand, model);
  const modelIsKnown = !!matchedModel;
  const modelSelectValue = modelIsKnown ? matchedModel!.name : model ? OTHER : "";

  const storageOptions = matchedModel?.storageOptions ?? [];
  const colorOptions = matchedModel?.colorOptions ?? [];

  const storageSelectValue = storage
    ? storageOptions.includes(storage)
      ? storage
      : OTHER
    : "";
  const colorSelectValue = color
    ? colorOptions.includes(color)
      ? color
      : OTHER
    : "";

  function setBrand(next: string) {
    // Switching brand resets the model + storage + color because the lists change.
    onChange({ brand: next, model: "", storage: "", color: "" });
  }

  function setModel(next: string) {
    onChange({ brand, model: next, storage: "", color: "" });
  }

  return (
    <>
      <div>
        <label className="label">Brand *</label>
        <select
          className="input"
          required={requireBrandModel}
          value={brandSelectValue}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") setBrand("");
            else if (v === OTHER) setBrand(brand && !brandIsKnown ? brand : "");
            else setBrand(v);
          }}
        >
          <option value="">Select brand…</option>
          {PHONE_BRANDS.map((b) => (
            <option key={b.slug} value={b.name}>{b.name}</option>
          ))}
          <option value={OTHER}>{OTHER_BRAND}…</option>
        </select>
        {brandSelectValue === OTHER && (
          <input
            className="input mt-2"
            placeholder="Brand name"
            value={brand}
            onChange={(e) => onChange({ brand: e.target.value, model, storage, color })}
          />
        )}
      </div>

      <div>
        <label className="label">Model *</label>
        {brandIsKnown ? (
          <>
            <select
              className="input"
              required={requireBrandModel}
              value={modelSelectValue}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") setModel("");
                else if (v === OTHER) setModel(model && !modelIsKnown ? model : "");
                else setModel(v);
              }}
            >
              <option value="">Select model…</option>
              {matchedBrand!.models.map((m) => (
                <option key={m.slug} value={m.name}>{m.name}</option>
              ))}
              <option value={OTHER}>Other…</option>
            </select>
            {modelSelectValue === OTHER && (
              <input
                className="input mt-2"
                placeholder="Model name"
                value={model}
                onChange={(e) => onChange({ brand, model: e.target.value, storage, color })}
              />
            )}
          </>
        ) : (
          <input
            className="input"
            required={requireBrandModel}
            placeholder="Model name"
            value={model}
            onChange={(e) => onChange({ brand, model: e.target.value, storage, color })}
          />
        )}
      </div>

      <div>
        <label className="label">Storage</label>
        {storageOptions.length > 0 ? (
          <>
            <select
              className="input"
              value={storageSelectValue}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") onChange({ brand, model, storage: "", color });
                else if (v === OTHER) onChange({ brand, model, storage: storage && !storageOptions.includes(storage) ? storage : "", color });
                else onChange({ brand, model, storage: v, color });
              }}
            >
              <option value="">Select storage…</option>
              {storageOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
              <option value={OTHER}>Other…</option>
            </select>
            {storageSelectValue === OTHER && (
              <input
                className="input mt-2"
                placeholder="e.g. 2TB"
                value={storage}
                onChange={(e) => onChange({ brand, model, storage: e.target.value, color })}
              />
            )}
          </>
        ) : (
          <input
            className="input"
            placeholder="128GB"
            value={storage}
            onChange={(e) => onChange({ brand, model, storage: e.target.value, color })}
          />
        )}
      </div>

      <div>
        <label className="label">Color</label>
        {colorOptions.length > 0 ? (
          <>
            <select
              className="input"
              value={colorSelectValue}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") onChange({ brand, model, storage, color: "" });
                else if (v === OTHER) onChange({ brand, model, storage, color: color && !colorOptions.includes(color) ? color : "" });
                else onChange({ brand, model, storage, color: v });
              }}
            >
              <option value="">Select color…</option>
              {colorOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value={OTHER}>Other…</option>
            </select>
            {colorSelectValue === OTHER && (
              <input
                className="input mt-2"
                placeholder="Color"
                value={color}
                onChange={(e) => onChange({ brand, model, storage, color: e.target.value })}
              />
            )}
          </>
        ) : (
          <input
            className="input"
            placeholder="Midnight"
            value={color}
            onChange={(e) => onChange({ brand, model, storage, color: e.target.value })}
          />
        )}
      </div>
    </>
  );
}
