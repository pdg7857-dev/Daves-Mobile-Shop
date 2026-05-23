import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { money, date } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLOR, type OrderStatus } from "@/lib/orders";
import { getProvince } from "@/lib/shipping";
import OrderActions from "./OrderActions";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isFinite(orderId)) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { phone: true, part: true } }, discountCode: true, daveCarePlans: true }
  });
  if (!order) notFound();

  const status = order.status as OrderStatus;
  const province = getProvince(order.province);

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-brand-700">← Back to orders</Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-gray-900 font-mono">{order.orderNumber}</h1><p className="text-sm text-gray-600">Placed {date(order.createdAt)}</p></div>
        <span className={`text-sm rounded-full px-3 py-1 font-medium ${ORDER_STATUS_COLOR[status] || "bg-gray-100"}`}>{ORDER_STATUS_LABELS[status] || order.status}</span>
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <h2 className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-900">Items</h2>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
                <tr><th className="table-cell">Item</th><th className="table-cell">Inventory</th><th className="table-cell text-right">Qty</th><th className="table-cell text-right">Price</th><th className="table-cell text-right">Total</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((i) => (
                  <tr key={i.id}>
                    <td className="table-cell">{i.name}</td>
                    <td className="table-cell text-xs">
                      {i.phone && (<Link href={`/admin/inventory/${i.phone.id}`} className="text-brand-700 hover:text-brand-900">📱 Phone · IMEI {i.phone.imei || "—"}</Link>)}
                      {i.part && (<Link href={`/admin/parts/${i.part.id}`} className="text-brand-700 hover:text-brand-900">🔧 Part · stock now {i.part.stock}</Link>)}
                    </td>
                    <td className="table-cell text-right">{i.quantity}</td>
                    <td className="table-cell text-right">{money(i.unitPrice)}</td>
                    <td className="table-cell text-right">{money(i.unitPrice * i.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="border-t border-gray-100 p-4 space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-gray-600">Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
              {order.discountAmount > 0 && (<div className="flex justify-between text-green-700"><dt>Discount{order.discountCode ? ` (${order.discountCode.code})` : ""}</dt><dd>−{money(order.discountAmount)}</dd></div>)}
              <div className="flex justify-between"><dt className="text-gray-600">Shipping</dt><dd>{order.shippingCost === 0 ? "Free" : money(order.shippingCost)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-600">Tax{province ? ` (${province.taxLabel})` : ""}</dt><dd>{money(order.taxAmount)}</dd></div>
              <div className="flex justify-between text-base font-bold border-t border-gray-100 pt-2 mt-2"><dt>Total</dt><dd className="text-brand-700">{money(order.total)}</dd></div>
            </dl>
          </div>

          <OrderActions id={order.id} initialStatus={status} initialTrackingNumber={order.trackingNumber || ""} initialCarrier={order.carrier || ""} initialAdminNotes={order.adminNotes || ""} />

          {order.daveCarePlans.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900">🛡️ Dave Care plans on this order</h2>
              <ul className="mt-3 space-y-2">
                {order.daveCarePlans.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <div>
                      <Link href={`/admin/dave-care/${p.id}`} className="font-medium text-gray-900 hover:text-brand-700">{p.phoneLabel}</Link>
                      <div className="text-xs text-gray-500 capitalize">{p.planType} · status: {p.status}</div>
                    </div>
                    <Link href={`/admin/dave-care/${p.id}`} className="text-brand-700 hover:text-brand-900 text-sm">Manage →</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900">Customer</h3>
            <p className="mt-2 text-sm text-gray-900">{order.customerName}</p>
            <p className="text-sm"><a href={`mailto:${order.customerEmail}`} className="text-brand-700 hover:text-brand-900">{order.customerEmail}</a></p>
            {order.customerPhone && (<p className="text-sm"><a href={`tel:${order.customerPhone}`} className="text-brand-700 hover:text-brand-900">{order.customerPhone}</a></p>)}
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900">Ship to</h3>
            <address className="mt-2 not-italic text-sm text-gray-700 leading-relaxed">{order.customerName}<br />{order.addressLine1}<br />{order.addressLine2 && <>{order.addressLine2}<br /></>}{order.city}, {order.province} {order.postalCode}<br />Canada</address>
          </div>
          {order.customerNotes && (<div className="card p-5 bg-amber-50 border-amber-100"><h3 className="font-semibold text-amber-900">Customer notes</h3><p className="mt-1 text-sm text-amber-800">{order.customerNotes}</p></div>)}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900">Timeline</h3>
            <ul className="mt-3 text-sm text-gray-700 space-y-1">
              <li>Placed: {date(order.createdAt)}</li>
              {order.paidAt && <li>Paid: {date(order.paidAt)}</li>}
              {order.shippedAt && <li>Shipped: {date(order.shippedAt)}</li>}
              {order.deliveredAt && <li>Delivered: {date(order.deliveredAt)}</li>}
              {order.cancelledAt && <li>Cancelled: {date(order.cancelledAt)}</li>}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
