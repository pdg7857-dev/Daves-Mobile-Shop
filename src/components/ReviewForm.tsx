"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

type Props = {
  phoneId: number;
  phoneLabel: string;
};

const MAX_PHOTOS = 3;

export default function ReviewForm({ phoneId, phoneLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function uploadPhoto(file: File) {
    if (photos.length >= MAX_PHOTOS) {
      setError(`Max ${MAX_PHOTOS} photos`);
      return;
    }
    if (!orderNumber || !email) {
      setError("Enter your order number and email first to upload photos.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const blob = await upload(`reviews/${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: `/api/reviews/upload?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`
      });
      setPhotos((p) => [...p, blob.url]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (rating < 1) {
      setError("Pick a star rating");
      return;
    }
    if (body.trim().length < 10) {
      setError("Tell us a bit more (at least 10 characters)");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        phoneId,
        rating,
        title: title.trim() || null,
        body: body.trim(),
        customerName: name.trim(),
        customerEmail: email.trim().toLowerCase(),
        orderNumber: orderNumber.trim() || null,
        photos
      })
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not submit review");
      return;
    }
    setSuccess(true);
  }

  if (!open) {
    return (
      <div className="mt-6 text-center">
        <button onClick={() => setOpen(true)} className="btn-primary">
          Write a review
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mt-6 card p-10 text-center">
        <p className="eyebrow text-[color:var(--apple-blue)]">Thank you</p>
        <h3 className="mt-2 text-2xl font-semibold text-white tracking-tight">Review submitted.</h3>
        <p className="mt-3 text-[14px] text-white/65">
          It&rsquo;s live now — refresh the page to see it. Your feedback helps other buyers.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 card p-7 space-y-4">
      <div>
        <p className="eyebrow text-[color:var(--apple-blue)]">Write a review</p>
        <h3 className="mt-2 text-xl font-semibold text-white tracking-tight">
          How was your {phoneLabel}?
        </h3>
        <p className="mt-1 text-[13px] text-white/55">
          Your review goes live immediately. Photos optional but really help other buyers see the real condition.
        </p>
      </div>

      {error && <div className="rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-sm p-3">{error}</div>}

      {/* Star picker */}
      <div>
        <label className="label">Rating *</label>
        <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              className={`text-[32px] leading-none transition-transform hover:scale-110 ${
                (hovered || rating) >= n ? "text-amber-400" : "text-white/15"
              }`}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Your name *</label>
          <input className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="First L." />
        </div>
        <div>
          <label className="label">Email *</label>
          <input className="input" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Order number (optional, unlocks photos)</label>
          <input className="input font-mono" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="DMS-XXXXXX" />
        </div>
      </div>

      <div>
        <label className="label">Title (optional)</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Genuinely surprised by the condition" />
      </div>

      <div>
        <label className="label">Your review *</label>
        <textarea
          className="input min-h-[120px]"
          required
          minLength={10}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What did you think? Battery life, condition, packaging, shipping speed…"
        />
      </div>

      {/* Photos */}
      {orderNumber && email && (
        <div>
          <label className="label">Photos (optional, up to {MAX_PHOTOS})</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {photos.map((url) => (
              <div key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-24 h-24 object-cover rounded-xl border border-white/15" />
                <button
                  type="button"
                  onClick={() => setPhotos((p) => p.filter((u) => u !== url))}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-black/80 border border-white/30 text-white text-xs"
                  aria-label="Remove photo"
                >
                  ×
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-white/15 flex items-center justify-center cursor-pointer hover:border-white/30 transition-colors">
                <span className="text-2xl text-white/45">+</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={busy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadPhoto(f);
                  }}
                />
              </label>
            )}
          </div>
          <p className="text-[12px] text-white/45">Photos require a valid order number for that email.</p>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? "Submitting…" : "Submit review"}
        </button>
      </div>
    </form>
  );
}
