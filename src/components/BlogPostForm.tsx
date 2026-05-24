"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhotoUpload from "@/components/PhotoUpload";

type Fields = {
  id?: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  metaTitle?: string | null;
  metaDesc?: string | null;
  keywords?: string | null;
  publishedAt?: string | null; // ISO date or null
  author?: string | null;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function BlogPostForm({ initial, mode }: { initial: Fields; mode: "create" | "edit" }) {
  const router = useRouter();
  const [form, setForm] = useState<Fields>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(publish: boolean | null) {
    setBusy(true);
    setError(null);
    const payload = {
      ...form,
      publishedAt:
        publish === true ? new Date().toISOString() : publish === false ? null : form.publishedAt
    };
    const url = mode === "create" ? "/api/admin/blog" : `/api/admin/blog/${initial.id}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Save failed");
      return;
    }
    const data = await res.json();
    router.push(`/admin/blog/${data.id}`);
    router.refresh();
  }

  async function remove() {
    if (!initial.id) return;
    if (!confirm("Delete this post permanently?")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/blog/${initial.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      router.push("/admin/blog");
      router.refresh();
    } else {
      setError("Delete failed");
    }
  }

  const isPublished = !!form.publishedAt;

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(null); }} className="space-y-6">
      {error && <div className="rounded-md bg-red-50 border border-red-200 text-red-800 text-sm p-3">{error}</div>}

      <fieldset className="card p-5 space-y-4">
        <legend className="px-2 text-sm font-semibold text-gray-700">Content</legend>
        <div>
          <label className="label">Title *</label>
          <input
            className="input"
            required
            value={form.title}
            onChange={(e) => {
              const t = e.target.value;
              update("title", t);
              if (mode === "create" && (!form.slug || form.slug === slugify(form.title))) {
                update("slug", slugify(t));
              }
            }}
          />
        </div>
        <div>
          <label className="label">Slug (URL) *</label>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 font-mono">/blog/</span>
            <input
              className="input flex-1 font-mono"
              required
              value={form.slug}
              onChange={(e) => update("slug", slugify(e.target.value))}
            />
          </div>
        </div>
        <div>
          <label className="label">Excerpt (1-2 sentences shown in the index)</label>
          <textarea
            className="input min-h-[60px]"
            value={form.excerpt ?? ""}
            onChange={(e) => update("excerpt", e.target.value)}
          />
        </div>
        <div>
          <PhotoUpload
            value={form.coverImage ?? null}
            onChange={(url) => update("coverImage", url)}
            label="Cover image"
          />
        </div>
        <div>
          <label className="label">Body (Markdown)</label>
          <textarea
            className="input min-h-[400px] font-mono text-sm"
            required
            value={form.content}
            onChange={(e) => update("content", e.target.value)}
            placeholder={"# Heading\n\nWrite your post in markdown. **Bold**, *italic*, [links](https://example.com), `code`,\n\n- bullet lists\n- like this\n\n> blockquotes too."}
          />
          <p className="mt-1 text-xs text-gray-500">
            Supports headings, bold, italic, links, inline + fenced code, lists, blockquotes.
          </p>
        </div>
      </fieldset>

      <fieldset className="card p-5 space-y-4">
        <legend className="px-2 text-sm font-semibold text-gray-700">SEO &amp; Google Ads</legend>
        <div>
          <label className="label">Meta title (defaults to post title)</label>
          <input
            className="input"
            value={form.metaTitle ?? ""}
            onChange={(e) => update("metaTitle", e.target.value)}
            placeholder="Up to ~60 characters for Google"
          />
        </div>
        <div>
          <label className="label">Meta description</label>
          <textarea
            className="input min-h-[60px]"
            value={form.metaDesc ?? ""}
            onChange={(e) => update("metaDesc", e.target.value)}
            placeholder="Up to ~155 characters. What shows in Google + social previews."
          />
        </div>
        <div>
          <label className="label">Keywords (comma-separated, used for Google Ads targeting)</label>
          <input
            className="input"
            value={form.keywords ?? ""}
            onChange={(e) => update("keywords", e.target.value)}
            placeholder="iPhone repair Toronto, mail-in screen replacement, refurbished iPhone Canada"
          />
        </div>
        <div>
          <label className="label">Author byline</label>
          <input
            className="input"
            value={form.author ?? ""}
            onChange={(e) => update("author", e.target.value)}
            placeholder="Dave's Mobile Shop"
          />
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {mode === "edit" && (
            <button type="button" onClick={remove} disabled={busy} className="btn-danger">Delete</button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {isPublished ? (
            <button type="button" onClick={() => save(false)} disabled={busy} className="btn-secondary">
              Unpublish
            </button>
          ) : (
            <button type="button" onClick={() => save(true)} disabled={busy} className="btn-primary">
              {busy ? "Saving…" : "Publish now"}
            </button>
          )}
          <button type="submit" disabled={busy} className="btn-secondary">
            {busy ? "Saving…" : "Save draft"}
          </button>
        </div>
      </div>
    </form>
  );
}
