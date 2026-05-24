import Link from "next/link";
import { prisma } from "@/lib/db";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Phone Repair Blog | Dave's Mobile Shop",
  description: "Repair guides, buying advice and iPhone / Samsung / Pixel deep-dives from the bench of a working repair shop."
};

export const dynamic = "force-dynamic";

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

export default async function BlogIndexPage() {
  const posts = await prisma.blogPost.findMany({
    where: { publishedAt: { not: null, lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    select: { id: true, slug: true, title: true, excerpt: true, coverImage: true, publishedAt: true, author: true }
  });

  return (
    <div className="container-narrow py-20">
      <header className="text-center max-w-3xl mx-auto">
        <p className="eyebrow">From the bench</p>
        <h1 className="mt-3 text-display-xl text-white tracking-tighter">The blog.</h1>
        <p className="mt-5 text-[18px] text-white/65 leading-relaxed">
          Repair guides, device deep-dives and what we&rsquo;re seeing on the workbench this week.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="mt-16 card p-12 text-center">
          <p className="eyebrow text-white/55">Coming soon</p>
          <h2 className="mt-2 text-2xl font-semibold text-white tracking-tight">First post on the way.</h2>
          <p className="mt-3 text-[14px] text-white/65">Check back soon — or ping us if there&rsquo;s a topic you want covered.</p>
        </div>
      ) : (
        <div className="mt-14 space-y-3">
          {posts.map((p, i) => (
            <Reveal key={p.id} delay={i * 50}>
              <Link href={`/blog/${p.slug}`} className="card card-hover p-7 block group">
                <div className="flex flex-col sm:flex-row gap-6">
                  {p.coverImage && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={p.coverImage} alt="" className="w-full sm:w-44 sm:h-32 object-cover rounded-xl" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="eyebrow text-white/50">
                      {fmtDate(p.publishedAt!)} {p.author ? `· ${p.author}` : ""}
                    </p>
                    <h2 className="mt-2 text-[22px] font-semibold text-white tracking-tighter">{p.title}</h2>
                    {p.excerpt && <p className="mt-2 text-[14px] text-white/65 leading-relaxed">{p.excerpt}</p>}
                    <p className="mt-4 link-chevron text-[13px]">Read post</p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
