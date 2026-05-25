import Link from "next/link";
import { prisma } from "@/lib/db";
import ReviewRowActions from "./ReviewRowActions";

export const dynamic = "force-dynamic";

type SearchParams = { status?: string };

function fmt(d: Date) {
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

export default async function AdminReviewsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const status = sp.status || "all";

  const where = status === "all" ? {} : { status };
  const [reviews, counts] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { phone: { select: { id: true, brand: true, model: true } } }
    }),
    prisma.review.groupBy({ by: ["status"], _count: { _all: true } })
  ]);

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count._all]));

  function chip(s: string, label: string) {
    const active = status === s;
    return (
      <Link
        key={s}
        href={`/admin/reviews${s === "all" ? "" : `?status=${s}`}`}
        className={`text-sm rounded-full px-3 py-1 ${
          active ? "bg-brand-700 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        {label}
      </Link>
    );
  }

  return (
    <div>
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-600">Customer reviews are auto-published. Hide spam / fakes here.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {chip("all", `All (${reviews.length})`)}
          {chip("approved", `Live (${countMap.approved || 0})`)}
          {chip("hidden", `Hidden (${countMap.hidden || 0})`)}
        </div>
      </header>

      <div className="mt-6 card overflow-hidden">
        {reviews.length === 0 ? (
          <p className="p-10 text-center text-gray-500">No reviews yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {reviews.map((r) => (
              <li key={r.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{r.customerName}</span>
                      <span className="text-amber-500">{"★".repeat(r.rating)}<span className="text-gray-300">{"★".repeat(5 - r.rating)}</span></span>
                      {r.status === "hidden" && (
                        <span className="text-xs rounded-full bg-gray-200 text-gray-700 px-2 py-0.5">Hidden</span>
                      )}
                      <span className="text-xs text-gray-500 ml-auto">{fmt(r.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {r.phone ? (
                        <Link href={`/inventory/${r.phone.id}`} target="_blank" className="text-brand-700 hover:underline">
                          {r.phone.brand} {r.phone.model}
                        </Link>
                      ) : "Device deleted"}
                      {" · "}{r.customerEmail}
                      {r.orderId && " · order linked"}
                    </p>
                    {r.title && <p className="mt-2 font-medium text-gray-900">{r.title}</p>}
                    <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{r.body}</p>
                    {r.photos.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {r.photos.map((url) => (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <a key={url} href={url} target="_blank" rel="noreferrer">
                            <img src={url} alt="" className="w-16 h-16 object-cover rounded border border-gray-200" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <ReviewRowActions id={r.id} status={r.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
