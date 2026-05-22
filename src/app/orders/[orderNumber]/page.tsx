import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { money, date } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLOR, type OrderStatus } from "@/lib/orders";
import { getProvince } from "@/lib/shipping";

type SearchParams = { email?: string; new?: string };

export default async function OrderStatusPage({
  params,
  searchParams
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { orderNumber } = await params;
  const sp = await searchParams;

  if (!sp.email) {
    // Force lookup via the form to avoid bare order URLs being readable
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Track your order</h1>
        <p className="mt-2 text-sm text-gray-600">Enter the email you used at checkout to view order {orderNumber}.</p>
        <form className="mt-8 card p-6 space-y-4" method="GET">
          <input type="hidden" name="email" defaultValue="" />
          <div>
            <label className="label">Email</label>
            <input className="input" required type="email" name="email" />
          </div>
          <button className="btn-primary w-full">View order</button>
        </form>
      </div>
    );
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber: decodeURIComponent(orderNumber).toUpperCase() },
    include: { items: true }
  });

  if (!order || order.customerEmail !== sp.email.trim().toLowerCase()) {
    notFound();
  }

  const isNew = sp.new === "1";
  const province = getProvince(order.province);
  const status = order.status as OrderStatus;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/orders" className="text-sm text-brand-700 hover:text-brand-900">← Look up another order</Link>

      {isNew && order.status === "pending_payment" && (
        <div className="mt-4 card p-5 bg-green-50 border-green-200">
          <h2 className="text-lg font-semibold text-green-900">🎉 Order placed!</h2>
          <p className="mt-1 text-sm text-green-900">
            Thanks {order.customerName.split(" ")[0]}. Send your Interac e-Transfer of <strong>{money(order.total)}</strong> to{" "}
            <strong>{process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "us"}</strong> with order number <strong>{order.orderNumber}</strong> in the memo.
            We&apos;ll email you a tracking number once your package ships.
          </p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order {order.orderNumber}</h1>
          <p className="text-sm text-gray-600">Placed {date(order.createdAt)}</p>
        </div>
        <span className={`text-sm rounded-full px-3 py-1 font-medium ${ORDER_STATUS_COLOR[status] || "bg-gray-100"}`}>
          {ORDER_STATUS_LABELS[status] || order.status}
        </span>
      </div>

      {order.trackingNumber && (
        <div className="mt-4 card p-4 bg-purple-50 border-purple-200">
          <h3 className="font-semibold text-purple-900">📦 Shipped</h3>
          <p className="mt-1 text-sm text-purple-900">
            Carrier: <strong>{order.carrier || "—"}</strong> · Tracking number: <strong className="font-mono">{order.trackingNumber}</strong>
            {order.shippedAt && <> · Shipped {date(order.shippedAt)}</>}
          </p>
        </div>
      )}

      <div className="mt-6 card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="table-cell">Item</th>
              <th className="table-cell text-right">Qty</th>
              <th className="table-cell text-right">Price</th>
              <th className="table-cell text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((i) => (
              <tr key={i.id}>
                <td className="table-cell">{i.name}</td>
                <td className="table-cell text-right">{i.quantity}</td>
                <td className="table-cell text-right">{money(i.unitPrice)}</td>
                <td className="table-cell text-right">{money(i.unitPrice * i.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="border-t border-gray-100 p-4 space-y-1 text-sm">
          <div className="flex justify-between"><dt className="text-gray-600">Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-600">Shipping</dt><dd>{order.shippingCost === 0 ? "Free" : money(order.shippingCost)}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-600">Tax{province ? ` (${province.taxLabel})` : ""}</dt><dd>{money(order.taxAmount)}</dd></div>
          <div className="flex justify-between text-base font-bold border-t border-gray-100 pt-2 mt-2">
            <dt>Total</dt><dd className="text-brand-700">{money(order.total)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900">Shipping to</h3>
          <address className="mt-2 not-italic text-sm text-gray-700 leading-relaxed">
            {order.customerName}<br />
            {order.addressLine1}<br />
            {order.addressLine2 && <>{order.addressLine2}<br /></>}
            {order.city}, {order.province} {order.postalCode}<br />
            Canada
          </address>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900">Contact</h3>
          <p className="mt-2 text-sm text-gray-700">{order.customerEmail}</p>
          {order.customerPhone && <p className="text-sm text-gray-700">{order.customerPhone}</p>}
          {order.customerNotes && (
            <p className="mt-3 text-xs text-gray-500 italic">Notes: {order.customerNotes}</p>
          )}
        </div>
      </div>

      <p className="mt-8 text-xs text-gray-500">
        Questions? <Link href="/contact" className="underline">Contact us</Link> with order number {order.orderNumber}.
      </p>
    </div>
  );
}
