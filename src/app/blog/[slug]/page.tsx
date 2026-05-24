import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || !post.publishedAt) return { title: "Post not found" };
  return {
    title: post.metaTitle || `${post.title} | Dave's Mobile Shop`,
    description: post.metaDesc || post.excerpt || `Phone repair article from Dave's Mobile Shop.`,
    keywords: post.keywords
      ? post.keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : undefined,
    openGraph: post.coverImage ? { images: [{ url: post.coverImage }] } : undefined
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || !post.publishedAt || post.publishedAt > new Date()) notFound();

  const html = renderMarkdown(post.content);

  return (
    <article className="container-narrow py-16">
      <Link href="/blog" className="text-[14px] text-white/55 hover:text-white">← All posts</Link>
      <header className="mt-6 text-center max-w-3xl mx-auto">
        <p className="eyebrow text-white/55">
          {fmtDate(post.publishedAt)} {post.author ? `· ${post.author}` : ""}
        </p>
        <h1 className="mt-3 text-display-lg text-white tracking-tighter">{post.title}</h1>
        {post.excerpt && (
          <p className="mt-5 text-[18px] text-white/65 leading-relaxed">{post.excerpt}</p>
        )}
      </header>

      {post.coverImage && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={post.coverImage}
          alt={post.title}
          className="mt-10 w-full max-h-[480px] object-cover rounded-3xl"
        />
      )}

      <div
        className="mt-12 max-w-2xl mx-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="mt-16 border-t border-white/[0.06] pt-8 text-center">
        <Link href="/blog" className="link-chevron">More from the blog</Link>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt || post.metaDesc || "",
            datePublished: post.publishedAt.toISOString(),
            dateModified: post.updatedAt.toISOString(),
            author: { "@type": "Organization", name: post.author || "Dave's Mobile Shop" },
            image: post.coverImage || undefined
          })
        }}
      />
    </article>
  );
}
