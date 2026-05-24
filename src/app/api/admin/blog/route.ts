import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const title = String(body.title ?? "").trim();
  const slug = String(body.slug ?? "").trim();
  const content = String(body.content ?? "").trim();
  if (!title || !slug || !content) {
    return NextResponse.json({ error: "title, slug and content are required" }, { status: 400 });
  }
  try {
    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt: body.excerpt ? String(body.excerpt).trim() : null,
        coverImage: body.coverImage ? String(body.coverImage).trim() : null,
        metaTitle: body.metaTitle ? String(body.metaTitle).trim() : null,
        metaDesc: body.metaDesc ? String(body.metaDesc).trim() : null,
        keywords: body.keywords ? String(body.keywords).trim() : null,
        author: body.author ? String(body.author).trim() : null,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null
      }
    });
    return NextResponse.json(post);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "Slug already exists — pick a different one" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
