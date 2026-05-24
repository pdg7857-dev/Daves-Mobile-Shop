import Link from "next/link";
import BlogPostForm from "@/components/BlogPostForm";

export const metadata = { title: "New blog post" };

export default function NewBlogPostPage() {
  return (
    <div>
      <Link href="/admin/blog" className="text-sm text-brand-700">← All posts</Link>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">New blog post</h1>
      <p className="text-sm text-gray-600 mb-6">Save as draft first, publish when ready.</p>
      <BlogPostForm
        mode="create"
        initial={{
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          coverImage: null,
          metaTitle: "",
          metaDesc: "",
          keywords: "",
          publishedAt: null,
          author: "Dave's Mobile Shop"
        }}
      />
    </div>
  );
}
