"use client";

import { useEffect } from "react";
import {
  DAVE_CARE_PRICES,
  DAVE_CARE_BENEFITS,
  DAVE_CARE_COVERAGE_PERIOD,
  annualSavings,
  type DaveCarePlanType
} from "@/lib/dave-care";
import { money } from "@/lib/format";

type Props = {
  phoneLabel: string;
  onChoose: (plan: DaveCarePlanType | null) => void;
  onClose: () => void;
  /** When true, frames the popup as a last-chance prompt at checkout */
  reminderMode?: boolean;
};

export default function DaveCarePopup({ phoneLabel, onChoose, onClose, reminderMode = false }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const savings = annualSavings();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-up"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dave-care-title"
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-[#1d1d1f] border border-white/[0.08] shadow-2xl shadow-black/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-7 border-b border-white/[0.06] flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="eyebrow text-[color:var(--apple-blue)]">
              {reminderMode ? "Are you sure?" : "Dave Care protection"}
            </p>
            <h2 id="dave-care-title" className="mt-2 text-[26px] leading-tight font-semibold text-white tracking-tighter">
              {reminderMode
                ? <>Protect your {phoneLabel} <span className="text-white/55">before checkout?</span></>
                : <>Add protection for your <span className="text-white/70">{phoneLabel}</span>?</>}
            </h2>
            <p className="mt-2 text-[14px] text-white/65 leading-relaxed">
              Stuff happens. Dave Care covers the four most common things that break — at no charge when you need them.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white/50 hover:text-white text-2xl leading-none -mt-1 -mr-1 px-2"
          >
            ×
          </button>
        </div>

        <div className="p-7">
          <p className="eyebrow text-white/55">What you get</p>
          <ul className="mt-3 space-y-1.5 text-[14px] text-white/85">
            {DAVE_CARE_BENEFITS.map((b) => (
              <li key={b.key} className="flex items-start gap-2.5">
                <span className="text-[color:var(--apple-blue)] mt-0.5">✓</span>
                <span>{b.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-white/45">
            One of each {DAVE_CARE_COVERAGE_PERIOD}. Covers this specific device only. Accidental damage included; intentional damage and water damage excluded.
          </p>

          <div className="mt-7 space-y-2.5">
            <button
              onClick={() => onChoose("annual")}
              className="w-full text-left rounded-2xl border border-[color:var(--apple-blue)]/60 bg-gradient-to-br from-[color:var(--apple-blue)]/15 to-[color:var(--apple-blue)]/5 p-5 hover:from-[color:var(--apple-blue)]/25 hover:to-[color:var(--apple-blue)]/10 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-[16px]">Annual plan</span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5 bg-[color:var(--apple-blue)] text-white">
                      Best value
                    </span>
                  </div>
                  <div className="mt-1 text-[13px] text-white/65">One payment · full year of coverage</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[22px] font-semibold tracking-tight text-white">{money(DAVE_CARE_PRICES.annual)}</div>
                  <div className="text-[12px] text-emerald-400 font-medium">Save {money(savings)}/yr</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => onChoose("monthly")}
              className="w-full text-left rounded-2xl border border-white/10 p-5 hover:border-white/20 hover:bg-white/[0.03] transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-white text-[16px]">Monthly plan</div>
                  <div className="mt-1 text-[13px] text-white/65">Pay as you go · cancel anytime</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[22px] font-semibold tracking-tight text-white">{money(DAVE_CARE_PRICES.monthly)}<span className="text-[13px] text-white/55 font-normal">/mo</span></div>
                </div>
              </div>
            </button>

            <button
              onClick={() => onChoose(null)}
              className="w-full text-center rounded-2xl border border-transparent p-3 text-[13px] text-white/55 hover:text-white/80 hover:bg-white/[0.03] transition-colors"
            >
              {reminderMode ? "No thanks, continue without protection" : "No thanks, just the phone"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
