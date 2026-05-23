"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "./CartProvider";
import DaveCarePopup from "./DaveCarePopup";
import type { DaveCarePlanType } from "@/lib/dave-care";

type Props = {
  item: Omit<CartItem, "quantity" | "daveCarePlan">;
};

export default function PhonePurchaseFlow({ item }: Props) {
  const { add } = useCart();
  const router = useRouter();
  const [pending, setPending] = useState<"add" | "buy" | null>(null);
  const [added, setAdded] = useState(false);

  function showPopup(action: "add" | "buy") {
    setPending(action);
  }

  function complete(plan: DaveCarePlanType | null) {
    if (!pending) return;
    add({ ...item, quantity: 1, daveCarePlan: plan });
    const action = pending;
    setPending(null);
    if (action === "buy") {
      router.push("/cart");
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => showPopup("add")} className="btn-secondary">
          {added ? "✓ Added" : "Add to cart"}
        </button>
        <button onClick={() => showPopup("buy")} className="btn-primary">
          Buy now
        </button>
      </div>
      {pending && (
        <DaveCarePopup
          phoneLabel={item.name}
          onChoose={complete}
          onClose={() => setPending(null)}
        />
      )}
    </>
  );
}
