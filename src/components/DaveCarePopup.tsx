"use client";

import { useEffect } from "react";
import { DAVE_CARE_PRICES, DAVE_CARE_BENEFITS, annualSavings, type DaveCarePlanType } from "@/lib/dave-care";
import { money } from "@/lib/format";

type Props = {
  phoneLabel: string;
  onChoose: (plan: DaveCarePlanType | null) => void;
  onClose: () => void;
};

export default function DaveCarePopup({ phoneLabel, onChoose, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="dave-care-title">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-wide text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">Protection plan</span>
            <h2 id="dave-care-title" className="mt-2 text-2xl font-bold text-gray-900">Protect your {phoneLabel}</h2>
            <p className="mt-1 text-sm text-gray-600">Stuff happens. Dave Care covers the four most common things that break.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-900 text-2xl leading-none">×</button>
        </div>
        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-700">What&apos;s included</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-800">
            {DAVE_CARE_BENEFITS.map((b) => (<li key={b.key} className="flex items-center gap-2"><span className="text-green-700">✓</span><span>{b.label}</span></li>))}
          </ul>
          <p className="mt-2 text-xs text-gray-500">Covers this specific device only. Subject to assessment — accidental damage included; intentional damage and water damage excluded.</p>
          <div className="mt-6 space-y-3">
            <button onClick={() => onChoose("annual")} className="w-full text-left rounded-lg border-2 border-brand-600 bg-brand-50 p-4 hover:bg-brand-100 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">Annual plan</div>
                  <div className="text-xs text-gray-600">One payment, full year of coverage</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-brand-700">{money(DAVE_CARE_PRICES.annual)}</div>
                  <div className="text-xs text-green-700 font-medium">Save {money(annualSavings())}/yr</div>
                </div>
              </div>
              <div className="mt-1 text-xs font-semibold text-brand-700">⭐ Best value</div>
            </button>
            <button onClick={() => onChoose("monthly")} className="w-full text-left rounded-lg border border-gray-300 p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">Monthly plan</div>
                  <div className="text-xs text-gray-600">Pay as you go — cancel anytime</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">{money(DAVE_CARE_PRICES.monthly)}/mo</div>
                </div>
              </div>
            </button>
            <button onClick={() => onChoose(null)} className="w-full text-center rounded-lg border border-gray-200 p-3 text-sm text-gray-600 hover:bg-gray-50">No thanks, just the phone</button>
          </div>
        </div>
      </div>
    </div>
  );
}
