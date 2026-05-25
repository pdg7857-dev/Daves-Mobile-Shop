import { prisma } from "@/lib/db";

type Props = {
  phoneId: number;
};

function Stars({ n }: { n: number }) {
  return (
    <span className="text-amber-400" aria-label={`${n} out of 5 stars`}>
      {"★".repeat(n)}
      <span className="text-white/15">{"★".repeat(5 - n)}</span>
    </span>
  );
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function ReviewList({ phoneId }: Props) {
  const reviews = await prisma.review.findMany({
    where: { phoneId, status: "approved" },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  if (reviews.length === 0) {
    return (
      <div className="card p-7 text-center">
        <p className="text-[14px] text-white/55">No reviews yet for this device.</p>
        <p className="mt-1 text-[13px] text-white/45">Be the first — share your experience below.</p>
      </div>
    );
  }

  const avg =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const avgStr = (Math.round(avg * 10) / 10).toFixed(1);

  return (
    <div>
      <div className="card p-5 flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-3">
          <span className="text-[32px] font-semibold tracking-tight text-white">{avgStr}</span>
          <div>
            <Stars n={Math.round(avg)} />
            <p className="text-[12px] text-white/55 mt-0.5">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
      </div>

      <ul className="space-y-3">
        {reviews.map((r) => (
          <li key={r.id} className="card p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-[color:var(--apple-blue)]/15 text-[color:var(--apple-blue)] flex items-center justify-center font-semibold text-[13px] shrink-0">
                {initials(r.customerName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 justify-between">
                  <p className="font-semibold text-white tracking-tight">{r.customerName}</p>
                  <Stars n={r.rating} />
                </div>
                <p className="text-[11px] text-white/45 mt-0.5">{fmtDate(r.createdAt)}</p>
                {r.title && (
                  <p className="mt-3 font-semibold text-white text-[15px] tracking-tight">{r.title}</p>
                )}
                <p className="mt-2 text-[14px] text-white/80 leading-relaxed whitespace-pre-wrap">{r.body}</p>
                {r.photos.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {r.photos.map((url) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <a key={url} href={url} target="_blank" rel="noreferrer">
                        <img
                          src={url}
                          alt=""
                          className="w-24 h-24 object-cover rounded-xl border border-white/10 hover:border-white/30 transition-colors"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
