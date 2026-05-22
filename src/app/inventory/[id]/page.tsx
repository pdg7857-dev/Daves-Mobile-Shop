import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { money, date } from "@/lib/format";
import { getCity } from "@/lib/cities";
import AddToCartButton from "@/components/AddToCartButton";

export default async function PhoneDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const phoneId = Number(id);
  if (!Number.isFinite(phoneId)) notFound();

  const phone = await prisma.phone.findUnique({
    where: { id: phoneId },
    include: { repairs: { orderBy: { performedAt: "desc" } } }
  });
  if (!phone || phone.status !== "for_sale" || phone.askingPrice == null) notFound();

  const city = phone.city ? getCity(phone.city) : undefined;
  const price = phone.askingPrice;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/inventory" className="text-sm text-brand-700 hover:text-brand-900">← Back to inventory</Link>

      <div className="mt-6 grid lg:grid-cols-2 gap-10">
        <div className="aspect-square rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[10rem]">
          {phone.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={phone.imageUrl} alt={`${phone.brand} ${phone.model}`} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <span>📱</span>
          )}
        </div>
        <div>
          <span className="text-sm uppercase tracking-wide text-brand-600 font-semibold">{phone.brand}</span>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">{phone.model}</h1>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            {phone.storage && <span className="rounded-full bg-gray-100 px-3 py-1">{phone.storage}</span>}
            {phone.color && <span className="rounded-full bg-gray-100 px-3 py-1">{phone.color}</span>}
            <span className="rounded-full bg-green-100 text-green-800 px-3 py-1">{phone.condition}</span>
          </div>

          <div className="mt-6 text-4xl font-bold text-brand-700">{money(price)}</div>
          <p className="mt-1 text-sm text-green-700">✓ In stock · Ships within 1 business day</p>
          {city && (
            <p className="mt-2 text-sm text-gray-600">Listed at our <Link href={`/locations/${city.slug}`} className="text-brand-700 hover:underline">{city.name}</Link> location · ships Canada-wide.</p>
          )}

          <div className="mt-6">
            <AddToCartButton item={{ type: "phone", id: phone.id, name: `${phone.brand} ${phone.model}${phone.storage ? ` ${phone.storage}` : ""}`, price, imageUrl: phone.imageUrl }} label="Add to cart" />
          </div>
          <p className="mt-3 text-xs text-gray-500">Free shipping on orders over $200. Prefer pickup? <Link href="/contact" className="underline">Contact us</Link>.</p>

          {phone.notes && (
            <div className="mt-6 card p-4 bg-amber-50 border-amber-100">
              <h3 className="text-sm font-semibold text-amber-900">Notes from our techs</h3>
              <p className="mt-1 text-sm text-amber-800">{phone.notes}</p>
            </div>
          )}
        </div>
      </div>

      {phone.repairs.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900">Service history</h2>
          <p className="mt-1 text-sm text-gray-600">Full transparency on what we&apos;ve done to this device.</p>
          <ul className="mt-6 space-y-3">
            {phone.repairs.map((r) => (
              <li key={r.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 capitalize">{r.serviceType.replace("-", " ")}</span>
                  <span className="text-xs text-gray-500">{date(r.performedAt)}</span>
                </div>
                {r.description && <p className="mt-1 text-sm text-gray-700">{r.description}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-12 card p-6 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">What&apos;s included</h2>
        <ul className="mt-3 text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>30-day full warranty</li>
          <li>Charging cable + adapter</li>
          <li>Free tempered-glass screen protector</li>
          <li>Tracked, insured shipping anywhere in Canada</li>
        </ul>
      </div>
    </div>
  );
}
