import OrderLookupForm from "./OrderLookupForm";

export const metadata = {
  title: "Track Your Order — Dave's Mobile Shop",
  description: "Enter your order number and email to check status and tracking."
};

export default function OrdersIndexPage() {
  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white">Track your order</h1>
      <p className="mt-2 text-sm text-gray-400">Enter the order number from your confirmation and the email you used at checkout.</p>
      <OrderLookupForm />
    </div>
  );
}
