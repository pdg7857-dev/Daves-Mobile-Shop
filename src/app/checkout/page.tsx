import CheckoutForm from "./CheckoutForm";

export const metadata = {
  title: "Checkout — Dave's Mobile Shop",
  description: "Complete your order. Shipping anywhere in Canada."
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
      <p className="mt-2 text-sm text-gray-600">Shipping anywhere in Canada. Payment by Interac e-Transfer on order confirmation.</p>
      <CheckoutForm />
    </div>
  );
}
