"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderLookupForm() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const num = orderNumber.trim().toUpperCase();
    if (!num) return;
    router.push(`/orders/${encodeURIComponent(num)}?email=${encodeURIComponent(email.trim())}`);
  }

  return (
    <form onSubmit={submit} className="mt-8 card p-6 space-y-4">
      <div>
        <label className="label">Order number</label>
        <input
          className="input font-mono uppercase"
          required
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="DMS-XXXXXX"
        />
      </div>
      <div>
        <label className="label">Email</label>
        <input
          className="input"
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button type="submit" className="btn-primary w-full">Look up order</button>
    </form>
  );
}
