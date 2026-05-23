import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { money, date } from "@/lib/format";
import { getCity } from "@/lib/cities";
import PhonePurchaseFlow from "@/components/PhonePurchaseFlow";
import { WARRANTY, DAVE_CARE_PRICES, annualSavings } from "@/lib/dave-care";

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
    <div className="container-narrow py-10">
      <Link href="/inventory" className="text-[14px] text-white/65 hover:text-white">
        ← Back to inventory
      </Link>

      <div className="mt-6 grid lg:grid-cols-2 gap-10">
        <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#2a2a2d] to-[#1d1d1f] flex items-center justify-center text-[10rem] overflow-hidden relative">
          {phone.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={phone.imageUrl} alt={`${phone.brand} ${phone.model}`} className="w-full h-full object-cover" />
          ) : (
            <span className="opacity-30">📱</span>
          )}
          <span className="absolute top-4 right-4 text-[11px] font-semibold tracking-wider uppercase rounded-full bg-black/60 backdrop-blur-md text-white/90 px-3 py-1.5 border border-white/15">
            {WARRANTY.phoneLabel}
          </span>
        </div>
        <div>
          <p className="eyebrow text-white/55">{phone.brand}</p>
          <h1 className="mt-2 text-display-md text-white tracking-tighter">{phone.model}</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-[13px]">
            {phone.storage && <span className="rounded-full bg-white/[0.06] border border-white/10 px-3 py-1 text-white/80">{phone.storage}</span>}
            {phone.color && <span className="rounded-full bg-white/[0.06] border border-white/10 px-3 py-1 text-white/80">{phone.color}</span>}
            <span className="rounded-full bg-emerald-500/15 text-emerald-300 px-3 py-1">{phone.condition}</span>
          </div>

          <div className="mt-7 text-display-md text-white tracking-tighter">{money(price)}</div>
          <p className="mt-1 text-[14px] text-emerald-400">✓ In stock · Ships within 1 business day</p>
          {city && (
            <p className="mt-2 text-[14px] text-white/55">
              Listed at our <Link href={`/locations/${city.slug}`} className="text-[color:var(--apple-blue)] hover:underline">{city.name}</Link> location · ships Canada-wide.
            </p>
          )}

          <div className="mt-7">
            <PhonePurchaseFlow
              item={{
                type: "phone",
                id: phone.id,
                name: `${phone.brand} ${phone.model}${phone.storage ? ` ${phone.storage}` : ""}`,
                price,
                imageUrl: phone.imageUrl
              }}
            />
          </div>
          <p className="mt-3 text-[12px] text-white/45">
            Free shipping on orders over $200. Prefer pickup? <Link href="/contact" className="underline">Contact us</Link>.
          </p>

          {phone.notes && (
            <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="eyebrow text-amber-300">Notes from our techs</p>
              <p className="mt-1 text-[14px] text-amber-200/90">{phone.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== Warranty + protection panel ===== */}
      <section className="mt-12 grid lg:grid-cols-2 gap-3">
        <div className="card p-7">
          <p className="eyebrow text-[color:var(--apple-blue)]">Included with every phone</p>
          <h2 className="mt-2 text-2xl font-semibold text-white tracking-tighter">
            {WARRANTY.phoneDays}-day warranty.
            <br />
            <span className="text-white/55">No fine print.</span>
          </h2>
          <ul className="mt-5 space-y-2.5 text-[14px] text-white/85">
            <li className="flex items-start gap-2.5"><span className="text-[color:var(--apple-blue)] mt-0.5">✓</span><span><strong className="text-white">{WARRANTY.phoneDays}-day full warranty</strong> on the device</span></li>
            <li className="flex items-start gap-2.5"><span className="text-[color:var(--apple-blue)] mt-0.5">✓</span><span>Charging cable + power adapter</span></li>
            <li className="flex items-start gap-2.5"><span className="text-[color:var(--apple-blue)] mt-0.5">✓</span><span>Free tempered-glass screen protector</span></li>
            <li className="flex items-start gap-2.5"><span className="text-[color:var(--apple-blue)] mt-0.5">✓</span><span>Tracked, insured shipping anywhere in Canada</span></li>
            <li className="flex items-start gap-2.5"><span className="text-[color:var(--apple-blue)] mt-0.5">✓</span><span>30-day money-back guarantee</span></li>
          </ul>
        </div>

        <div className="card p-7 relative overflow-hidden">
          <div
            className="pointer-events-none absolute -right-16 -bottom-16 h-72 w-72 rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(circle, #0071e3 0%, transparent 65%)" }}
          />
          <div className="relative">
            <p className="eyebrow text-[color:var(--apple-blue)]">Optional protection</p>
            <h2 className="mt-2 text-2xl font-semibold text-white tracking-tighter">
              Want full coverage?
            </h2>
            <p className="mt-3 text-[14px] text-white/70 leading-relaxed">
              Dave Care gets you a free <strong className="text-white">screen, battery, camera and back glass</strong> replacement — one of each, every 12 months.
            </p>
            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-display-md text-white tracking-tighter">{money(DAVE_CARE_PRICES.annual)}</span>
              <span className="text-[13px] text-white/55">/yr</span>
              <span className="text-[12px] text-emerald-400 font-medium">Save {money(annualSavings())} vs monthly</span>
            </div>
            <p className="mt-2 text-[13px] text-white/55">
              Or {money(DAVE_CARE_PRICES.monthly)}/mo. Choose at checkout.
            </p>
          </div>
        </div>
      </section>

      {phone.repairs.length > 0 && (
        <div className="mt-12">
          <p className="eyebrow text-white/55">Service history</p>
          <h2 className="mt-2 text-display-md text-white tracking-tighter">Full transparency.</h2>
          <p className="mt-2 text-[14px] text-white/65">
            Everything we&rsquo;ve done to this device.
          </p>
          <ul className="mt-6 space-y-3">
            {phone.repairs.map((r) => (
              <li key={r.id} className="card p-5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white capitalize tracking-tight">{r.serviceType.replace("-", " ")}</span>
                  <span className="text-[12px] text-white/50">{date(r.performedAt)}</span>
                </div>
                {r.description && <p className="mt-1.5 text-[14px] text-white/75">{r.description}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
