import CartView from "./CartView";
import { getShippingConfig } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your cart — Dave's Mobile Shop",
  description: "Review the phones and parts in your cart before checkout."
};

export default async function CartPage() {
  const shippingConfig = await getShippingConfig();
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-white">Your cart</h1>
      <CartView freeShippingThreshold={shippingConfig.freeShippingThreshold} />
    </div>
  );
}
