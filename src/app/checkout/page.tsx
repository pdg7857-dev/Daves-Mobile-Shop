import CheckoutForm from "./CheckoutForm";
import { getShippingConfig } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout — Dave's Mobile Shop",
  description: "Complete your order. Shipping anywhere in Canada."
};

export default async function CheckoutPage() {
  const shippingConfig = await getShippingConfig();
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-white">Checkout</h1>
      <p className="mt-2 text-sm text-gray-400">Shipping anywhere in Canada. Payment by Interac e-Transfer on order confirmation.</p>
      <CheckoutForm shippingConfig={shippingConfig} />
    </div>
  );
}
