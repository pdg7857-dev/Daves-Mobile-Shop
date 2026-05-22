import CartView from "./CartView";

export const metadata = {
  title: "Your cart — Dave's Mobile Shop",
  description: "Review the phones and parts in your cart before checkout."
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Your cart</h1>
      <CartView />
    </div>
  );
}
