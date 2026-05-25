"use client";

import { useEffect, useState } from "react";

const DISMISSED_KEY = "dms_chat_dismissed_v1";

type Props = {
  /** E.164 phone, e.g. "+14165550123" — opens wa.me/<digits> */
  whatsappPhone?: string;
  /** Facebook page username — opens m.me/<username> */
  messengerUsername?: string;
};

function digitsOnly(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

// ---------- questionnaire definition ----------
type Topic = "buy" | "repair" | "sell" | "wholesale" | "other";

const TOPICS: Array<{ key: Topic; label: string; emoji: string }> = [
  { key: "buy", label: "Buy a phone", emoji: "🛒" },
  { key: "repair", label: "Repair my phone", emoji: "🔧" },
  { key: "sell", label: "Sell / trade in my phone", emoji: "💵" },
  { key: "wholesale", label: "Wholesale / business", emoji: "🏢" },
  { key: "other", label: "Just have a question", emoji: "💬" }
];

const FOLLOWUPS: Record<Topic, { question: string; options: string[] } | null> = {
  buy: { question: "Which brand?", options: ["Apple iPhone", "Samsung Galaxy", "Google Pixel", "Not sure yet"] },
  repair: { question: "What's wrong?", options: ["Cracked screen", "Battery dying fast", "Charging issue", "Water damage", "Other"] },
  sell: { question: "Which device?", options: ["iPhone", "Samsung Galaxy", "Pixel", "Other"] },
  wholesale: null,
  other: null
};

function buildMessage(topic: Topic, followup?: string): string {
  switch (topic) {
    case "buy":
      return followup === "Not sure yet"
        ? "Hi! I'm thinking of buying a phone — can you help me figure out which one?"
        : `Hi! I'm looking to buy a${followup?.startsWith("Apple") ? "n" : ""} ${followup}. What do you have in stock?`;
    case "repair":
      return `Hi! I need a repair — ${followup ?? "issue with my phone"}. Can you give me a quote?`;
    case "sell":
      return `Hi! I want to sell my ${followup ?? "phone"}. What can you offer me?`;
    case "wholesale":
      return "Hi! I run a shop and want to talk about wholesale pricing on parts and devices.";
    case "other":
      return "Hi! I have a question.";
  }
}
// -----------------------------------------------

type Step = "topic" | "followup" | "apps";

export default function ChatBubble({ whatsappPhone, messengerUsername }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("topic");
  const [topic, setTopic] = useState<Topic | null>(null);
  const [followup, setFollowup] = useState<string | undefined>(undefined);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(DISMISSED_KEY) === "1") return;
    const t = setTimeout(() => setShowTooltip(true), 3500);
    return () => clearTimeout(t);
  }, []);

  function dismissTooltip() {
    setShowTooltip(false);
    try {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function toggle() {
    if (showTooltip) dismissTooltip();
    if (open) {
      // closing -> reset wizard
      setStep("topic");
      setTopic(null);
      setFollowup(undefined);
    }
    setOpen((o) => !o);
  }

  function pickTopic(t: Topic) {
    setTopic(t);
    if (FOLLOWUPS[t]) {
      setStep("followup");
    } else {
      setStep("apps");
    }
  }

  function pickFollowup(opt: string) {
    setFollowup(opt);
    setStep("apps");
  }

  function skipQuestions() {
    setTopic("other");
    setFollowup(undefined);
    setStep("apps");
  }

  function back() {
    if (step === "apps" && topic && FOLLOWUPS[topic]) {
      setStep("followup");
      setFollowup(undefined);
    } else {
      setStep("topic");
      setTopic(null);
      setFollowup(undefined);
    }
  }

  // Clean inputs (strip whitespace, common paste artifacts)
  const waClean = (whatsappPhone || "").trim();
  const msgClean = (messengerUsername || "").trim().replace(/^@/, "");

  // Render nothing if neither contact is configured (e.g. dev w/o env vars).
  if (!waClean && !msgClean) return null;

  const message = topic ? buildMessage(topic, followup) : "Hi! I have a question.";
  const waLink = waClean
    ? `https://wa.me/${digitsOnly(waClean)}?text=${encodeURIComponent(message)}`
    : null;
  const fbLink = msgClean
    ? `https://m.me/${msgClean}?ref=${encodeURIComponent(message.slice(0, 90))}`
    : null;

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
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-[#1d1d1f] border-r border-b border-white/10 rotate-45" />
        </div>
      )}

      {/* Expanded panel */}
      {open && (
        <div className="animate-fade-up rounded-2xl bg-[#1d1d1f] border border-white/10 shadow-2xl shadow-black/60 backdrop-blur-xl w-[320px] overflow-hidden">
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              {step !== "topic" ? (
                <button
                  onClick={back}
                  className="text-[12px] text-white/55 hover:text-white tracking-tight"
                >
                  ← Back
                </button>
              ) : (
                <p className="eyebrow text-[color:var(--apple-blue)]">Chat with us</p>
              )}
              <p className="text-[11px] text-white/40">Step {step === "topic" ? 1 : step === "followup" ? 2 : 3} of 3</p>
            </div>
            <p className="mt-2 text-[15px] font-semibold text-white tracking-tight">
              {step === "topic" && "What can we help with?"}
              {step === "followup" && topic && FOLLOWUPS[topic]?.question}
              {step === "apps" && "Pick your favorite app"}
            </p>
            <p className="mt-1 text-[12px] text-white/55 leading-snug">
              {step === "topic" && "Pick one and we'll fast-track your message."}
              {step === "followup" && "This helps us answer faster."}
              {step === "apps" && "We'll prefill the message for you."}
            </p>
          </div>

          {/* Body */}
          <div className="p-2">
            {step === "topic" &&
              TOPICS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => pickTopic(t.key)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.06] transition-colors text-left group"
                >
                  <span className="text-xl">{t.emoji}</span>
                  <span className="flex-1 text-[14px] font-medium text-white">{t.label}</span>
                  <span className="text-white/30 group-hover:text-white/70 transition-colors">›</span>
                </button>
              ))}

            {step === "followup" && topic && FOLLOWUPS[topic] && (
              <>
                {FOLLOWUPS[topic]!.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => pickFollowup(opt)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.06] transition-colors text-left group"
                  >
                    <span className="flex-1 text-[14px] font-medium text-white">{opt}</span>
                    <span className="text-white/30 group-hover:text-white/70 transition-colors">›</span>
                  </button>
                ))}
              </>
            )}

            {step === "apps" && (
              <>
                {/* Preview the prefilled message */}
                <div className="mx-1 mb-2 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                  <p className="text-[11px] text-white/45 uppercase tracking-wider mb-1">Your message</p>
                  <p className="text-[13px] text-white/85 italic leading-snug">&ldquo;{message}&rdquo;</p>
                </div>

                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={toggle}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.06] transition-colors group"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white" aria-hidden>
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
                    onClick={toggle}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.06] transition-colors group"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0099ff] to-[#a033ff] text-white" aria-hidden>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.4 2 2 6.2 2 11.5c0 2.9 1.4 5.5 3.6 7.3v3.7l3.3-1.8c.9.2 1.9.4 3.1.4 5.6 0 10-4.2 10-9.5S17.6 2 12 2zm1 12.8l-2.5-2.7-4.9 2.7 5.4-5.7 2.6 2.7 4.8-2.7-5.4 5.7z"/></svg>
                    </span>
                    <div className="flex-1">
                      <div className="text-[14px] font-medium text-white">Messenger</div>
                      <div className="text-[11px] text-white/55">Open in Messenger</div>
                    </div>
                    <span className="text-white/30 group-hover:text-white/70 transition-colors">›</span>
                  </a>
                )}
              </>
            )}
          </div>

          {/* Skip on first step */}
          {step === "topic" && (
            <div className="border-t border-white/[0.06] p-2">
              <button
                onClick={skipQuestions}
                className="w-full text-center px-3 py-2.5 rounded-xl text-[12px] text-white/55 hover:text-white hover:bg-white/[0.03] transition-colors"
              >
                Skip — just open chat
              </button>
            </div>
          )}
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
        {showTooltip && !open && (
          <span className="absolute inset-0 rounded-full bg-[color:var(--apple-blue)] opacity-30 animate-ping" />
        )}
      </button>
    </div>
  );
}
