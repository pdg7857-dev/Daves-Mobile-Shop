import Link from "next/link";
import DiscountForm from "@/components/DiscountForm";

export default function NewDiscountPage() {
  return (
    <div>
      <Link href="/admin/discounts" className="text-sm text-brand-700">← Back to discounts</Link>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">New discount code</h1>
      <p className="text-sm text-gray-600 mb-6">Customers enter this code at checkout to get a discount.</p>
      <DiscountForm
        mode="create"
        initial={{
          code: "",
          description: "",
          discountType: "percentage",
          discountValue: 10,
          minOrderAmount: null,
          maxUses: null,
          active: true,
          expiresAt: null
        }}
      />
    </div>
  );
}
