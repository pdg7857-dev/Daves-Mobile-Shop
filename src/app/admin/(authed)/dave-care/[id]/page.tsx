import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { money, date } from "@/lib/format";
import { DAVE_CARE_BENEFITS, claimsRemaining } from "@/lib/dave-care";
import PlanActions from "./PlanActions";
import ClaimForm from "./ClaimForm";

export const dynamic = "force-dynamic";

const CLAIM_LABELS: Record<string, string> = {
  screen: "Screen",
  battery: "Battery",
  camera: "Camera",
  backGlass: "Back glass"
};

export default async function DaveCareDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const planId = Number(id);
  if (!Number.isFinite(planId)) notFound();

  const plan = await prisma.daveCarePlan.findUnique({
    where: { id: planId },
    include: {
      order: true,
      phone: true,
      claims: { orderBy: { performedAt: "desc" } }
    }
  });
  if (!plan) notFound();

  const totalUpgradeRevenue = plan.claims.reduce((s, c) => s + (c.upgradePaid ?? 0), 0);
  const totalCost = plan.claims.reduce((s, c) => s + (c.partCost ?? 0) + (c.laborCost ?? 0), 0);

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
            <h2 className="font-semibold text-gray-900">Coverage status</h2>
            <p className="text-xs text-gray-500 mt-1">Each box can only be checked once per 12-month coverage period.</p>
            <PlanActions
              id={plan.id}
              initialStatus={plan.status}
              initialNotes={plan.notes ?? ""}
              initialClaims={{
                batteryUsed: plan.batteryUsed,
                cameraUsed: plan.cameraUsed,
                screenUsed: plan.screenUsed,
                backGlassUsed: plan.backGlassUsed
              }}
            />
          </div>

          {/* ===== Claim log ===== */}
          <div className="card p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-semibold text-gray-900">Repair claims</h2>
              <div className="flex gap-4 text-xs text-gray-600">
                <span>Upgrade revenue: <strong className="text-emerald-700">{money(totalUpgradeRevenue)}</strong></span>
                <span>Internal cost: <strong className="text-red-700">{money(totalCost)}</strong></span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Detailed history of each repair claim under this plan — what was fixed, OLED vs LCD,
              upgrade fees the customer paid us out-of-pocket.
            </p>

            <div className="mt-4">
              <ClaimForm
                planId={plan.id}
                usedClaims={{
                  battery: plan.batteryUsed,
                  camera: plan.cameraUsed,
                  screen: plan.screenUsed,
                  backGlass: plan.backGlassUsed
                }}
              />
            </div>

            {plan.claims.length > 0 && (
              <table className="mt-5 w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-200">
                    <th className="py-2">When</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Spec</th>
                    <th className="py-2 text-right">Upgrade $</th>
                    <th className="py-2 text-right">Cost</th>
                    <th className="py-2">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {plan.claims.map((c) => (
                    <tr key={c.id}>
                      <td className="py-2 text-xs text-gray-600 whitespace-nowrap">{date(c.performedAt)}</td>
                      <td className="py-2 font-medium text-gray-900">{CLAIM_LABELS[c.claimType] ?? c.claimType}</td>
                      <td className="py-2">
                        {c.screenType && (
                          <span className={`text-xs rounded-full px-2 py-0.5 ${c.screenType === "OLED" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-700"}`}>
                            {c.screenType}
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-right text-emerald-700">{(c.upgradePaid ?? 0) > 0 ? money(c.upgradePaid!) : "—"}</td>
                      <td className="py-2 text-right text-red-700">{((c.partCost ?? 0) + (c.laborCost ?? 0)) > 0 ? money((c.partCost ?? 0) + (c.laborCost ?? 0)) : "—"}</td>
                      <td className="py-2 text-xs text-gray-700">{c.description ?? ""}{c.performedBy ? <span className="text-gray-500"> · {c.performedBy}</span> : null}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
