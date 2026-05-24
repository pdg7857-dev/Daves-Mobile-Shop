"use client";

import { useEffect, useState } from "react";

const DISMISSED_KEY = "dms_chat_dismissed_v1";

type Props = {
  /** E.164 phone, e.g. "+14165550123" — opens wa.me/<digits> */
  whatsappPhone?: string;
  /** Facebook page username — opens m.me/<username> */
  messengerUsername?: string;
  /** Optional pre-filled message text */
  prefilled?: string;
};

function digitsOnly(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export default function ChatBubble({ whatsappPhone, messengerUsername, prefilled = "Hi! I have a question about my phone." }: Props) {
  const [open, setOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(DISMISSED_KEY) === "1") {
      setTooltipDismissed(true);
      return;
    }
    const t = setTimeout(() => setShowTooltip(true), 3500);
    return () => clearTimeout(t);
  }, []);

  function dismissTooltip() {
    setShowTooltip(false);
    setTooltipDismissed(true);
    try {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function toggle() {
    if (showTooltip) dismissTooltip();
    setOpen((o) => !o);
  }

  if (!whatsappPhone && !messengerUsername) return null;

  const waLink = whatsappPhone
    ? `https://wa.me/${digitsOnly(whatsappPhone)}?text=${encodeURIComponent(prefilled)}`
    : null;
  const fbLink = messengerUsername ? `https://m.me/${messengerUsername}` : null;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {/* Tooltip prompt */}
      {showTooltip && !open && (
        <div className="animate-fade-up rounded-2xl bg-[#1d1d1f] border border-white/10 shadow-2xl shadow-black/40 px-4 py-3 pr-9 max-w-[260px] relative">
          <p className="text-[14px] text-white font-medium tracking-tight">👋 Chat with us</p>
          <p className="mt-1 text-[12px] text-white/65 leading-snug">
            Questions about a repair or device? We typically reply within 30 minutes.
          </p>
          <button
            onClick={dismissTooltip}
            aria-label="Dismiss"
            className="absolute top-1.5 right-2 text-white/45 hover:text-white text-lg leading-none p-1"
          >
            ×
          </button>
          {/* little chat tail */}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-[#1d1d1f] border-r border-b border-white/10 rotate-45" />
        </div>
      )}

      {/* Expanded panel */}
      {open && (
        <div className="animate-fade-up rounded-2xl bg-[#1d1d1f] border border-white/10 shadow-2xl shadow-black/60 backdrop-blur-xl w-[290px] overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
            <p className="eyebrow text-[color:var(--apple-blue)]">Chat with us</p>
            <p className="mt-1.5 text-[15px] font-semibold text-white tracking-tight">
              Pick your favorite app.
            </p>
            <p className="mt-1 text-[12px] text-white/55 leading-snug">
              We&rsquo;ll get back to you fast. Usually within 30 minutes.
            </p>
          </div>
          <div className="p-2">
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.06] transition-colors group"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white text-[18px]" aria-hidden>
                  {/* WhatsApp glyph */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.4-1.4-.9-.8-1.5-1.8-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2.1-.4 0-.5 0-.1-.6-1.5-.9-2.1-.2-.5-.5-.5-.6-.5h-.5c-.2 0-.4.1-.6.3-.2.3-.9.9-.9 2.1s.9 2.5 1 2.7c.1.2 1.7 2.6 4.1 3.6.6.2 1 .4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.7-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.7.4 3.3 1.3 4.8L2 22l5.4-1.4c1.4.8 3 1.2 4.6 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.2.8.9-3.1-.2-.3c-.9-1.4-1.3-3-1.3-4.6 0-4.5 3.7-8.2 8.2-8.2s8.2 3.7 8.2 8.2-3.7 8.2-8.2 8.2z"/></svg>
                </span>
                <div className="flex-1">
                  <div className="text-[14px] font-medium text-white">WhatsApp</div>
                  <div className="text-[11px] text-white/55">Open in WhatsApp</div>
                </div>
                <span className="text-white/30 group-hover:text-white/70 transition-colors">›</span>
              </a>
            )}
            {fbLink && (
              <a
                href={fbLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.06] transition-colors group"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0099ff] to-[#a033ff] text-white text-[18px]" aria-hidden>
                  {/* Messenger glyph */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.4 2 2 6.2 2 11.5c0 2.9 1.4 5.5 3.6 7.3v3.7l3.3-1.8c.9.2 1.9.4 3.1.4 5.6 0 10-4.2 10-9.5S17.6 2 12 2zm1 12.8l-2.5-2.7-4.9 2.7 5.4-5.7 2.6 2.7 4.8-2.7-5.4 5.7z"/></svg>
                </span>
                <div className="flex-1">
                  <div className="text-[14px] font-medium text-white">Messenger</div>
                  <div className="text-[11px] text-white/55">Open in Messenger</div>
                </div>
                <span className="text-white/30 group-hover:text-white/70 transition-colors">›</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Floating action button */}
      <button
        onClick={toggle}
        aria-label={open ? "Close chat" : "Chat with us"}
        className="h-14 w-14 rounded-full bg-[color:var(--apple-blue)] hover:bg-[color:var(--apple-blue-hover)] shadow-2xl shadow-[color:var(--apple-blue)]/40 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 relative"
      >
        {open ? (
          <span className="text-2xl leading-none">×</span>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
        {/* Pulsing ring when tooltip is showing */}
        {showTooltip && !open && (
          <span className="absolute inset-0 rounded-full bg-[color:var(--apple-blue)] opacity-30 animate-ping" />
        )}
      </button>
    </div>
  );
}
