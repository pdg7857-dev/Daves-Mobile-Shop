import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

export default async function AdminBlogListPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: { id: true, slug: true, title: true, publishedAt: true, updatedAt: true }
  });

  return (
    <div>
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="text-sm text-gray-600">Write posts to drive SEO and Google Ads traffic.</p>
        </div>
        <Link href="/admin/blog/new" className="btn-primary">+ New post</Link>
      </header>

      <div className="mt-6 card overflow-hidden">
        {posts.length === 0 ? (
          <p className="p-10 text-center text-gray-500">No posts yet. Write your first one.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">
              <tr>
                <th className="table-cell">Title</th>
                <th className="table-cell">Slug</th>
                <th className="table-cell">Status</th>
                <th className="table-cell">Updated</th>
                <th className="table-cell"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((p) => (
                <tr key={p.id}>
                  <td className="table-cell font-medium text-gray-900">{p.title}</td>
                  <td className="table-cell font-mono text-xs text-gray-600">/{p.slug}</td>
                  <td className="table-cell">
                    {p.publishedAt ? (
                      <span className="text-xs rounded-full bg-green-100 text-green-800 px-2 py-0.5">
                        Live · {fmtDate(p.publishedAt)}
                      </span>
                    ) : (
                      <span className="text-xs rounded-full bg-gray-200 text-gray-700 px-2 py-0.5">Draft</span>
                    )}
                  </td>
                  <td className="table-cell text-xs text-gray-500">{fmtDate(p.updatedAt)}</td>
                  <td className="table-cell text-right">
                    <Link href={`/admin/blog/${p.id}`} className="text-brand-700 text-sm">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
