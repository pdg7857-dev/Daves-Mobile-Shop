import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { money, date } from "@/lib/format";
import { DAVE_CARE_BENEFITS, claimsRemaining } from "@/lib/dave-care";
import PlanActions from "./PlanActions";

export const dynamic = "force-dynamic";

export default async function DaveCareDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const planId = Number(id);
  if (!Number.isFinite(planId)) notFound();

  const plan = await prisma.daveCarePlan.findUnique({ where: { id: planId }, include: { order: true, phone: true } });
  if (!plan) notFound();

  return (
    <div>
      <Link href="/admin/dave-care" className="text-sm text-brand-700">← Back to Dave Care</Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plan #{plan.id} — {plan.phoneLabel}</h1>
          <p className="text-sm text-gray-600">Started {date(plan.startedAt)} · {plan.planType === "annual" ? "Annual" : "Monthly"} · {money(plan.pricePaid)}</p>
        </div>
        <span className={`text-sm rounded-full px-3 py-1 font-medium capitalize ${plan.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>{plan.status}</span>
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900">Coverage</h2>
            <p className="text-xs text-gray-500 mt-1">Toggle a service when the customer claims it. Each box can only be checked once per plan.</p>
            <PlanActions id={plan.id} initialStatus={plan.status} initialNotes={plan.notes ?? ""} initialClaims={{ batteryUsed: plan.batteryUsed, cameraUsed: plan.cameraUsed, screenUsed: plan.screenUsed, backGlassUsed: plan.backGlassUsed }} />
          </div>
        </div>

        <aside className="space-y-5">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900">Customer</h3>
            <p className="mt-2 text-sm text-gray-900">{plan.customerName}</p>
            <p className="text-sm"><a href={`mailto:${plan.customerEmail}`} className="text-brand-700 hover:text-brand-900">{plan.customerEmail}</a></p>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900">Order</h3>
            <p className="mt-2 text-sm"><Link href={`/admin/orders/${plan.orderId}`} className="text-brand-700 hover:text-brand-900 font-mono">{plan.order.orderNumber}</Link></p>
            <p className="text-xs text-gray-500 mt-1">Order total {money(plan.order.total)}</p>
          </div>
          {plan.phone && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900">Device</h3>
              <p className="mt-2 text-sm">{plan.phoneLabel}</p>
              {plan.phone.imei && <p className="text-xs text-gray-500 font-mono">IMEI {plan.phone.imei}</p>}
              <Link href={`/admin/inventory/${plan.phone.id}`} className="mt-2 inline-block text-sm text-brand-700 hover:text-brand-900">View in inventory →</Link>
            </div>
          )}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900">Term</h3>
            <p className="mt-2 text-xs text-gray-600">Started: {date(plan.startedAt)}</p>
            {plan.expiresAt && <p className="text-xs text-gray-600">Expires: {date(plan.expiresAt)}</p>}
            <p className="text-xs text-gray-600 mt-2">{claimsRemaining(plan)}/{DAVE_CARE_BENEFITS.length} claims remaining</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
