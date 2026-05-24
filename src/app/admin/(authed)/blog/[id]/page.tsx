import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import BlogPostForm from "@/components/BlogPostForm";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId)) notFound();
  const post = await prisma.blogPost.findUnique({ where: { id: postId } });
  if (!post) notFound();

  return (
    <div>
      <Link href="/admin/blog" className="text-sm text-brand-700">← All posts</Link>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
        {post.publishedAt && (
          <Link href={`/blog/${post.slug}`} target="_blank" className="text-sm text-brand-700">View live ↗</Link>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-6">/blog/{post.slug}</p>
      <BlogPostForm
        mode="edit"
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          metaTitle: post.metaTitle,
          metaDesc: post.metaDesc,
          keywords: post.keywords,
          publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
          author: post.author
        }}
      />
    </div>
  );
}
