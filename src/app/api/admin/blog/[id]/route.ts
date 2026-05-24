import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if ("title" in body) data.title = String(body.title).trim();
  if ("slug" in body) data.slug = String(body.slug).trim();
  if ("content" in body) data.content = String(body.content).trim();
  if ("excerpt" in body) data.excerpt = body.excerpt ? String(body.excerpt).trim() : null;
  if ("coverImage" in body) data.coverImage = body.coverImage ? String(body.coverImage).trim() : null;
  if ("metaTitle" in body) data.metaTitle = body.metaTitle ? String(body.metaTitle).trim() : null;
  if ("metaDesc" in body) data.metaDesc = body.metaDesc ? String(body.metaDesc).trim() : null;
  if ("keywords" in body) data.keywords = body.keywords ? String(body.keywords).trim() : null;
  if ("author" in body) data.author = body.author ? String(body.author).trim() : null;
  if ("publishedAt" in body) data.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;

  try {
    const post = await prisma.blogPost.update({ where: { id: postId }, data });
    return NextResponse.json(post);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Update failed";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId)) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  await prisma.blogPost.delete({ where: { id: postId } });
  return NextResponse.json({ ok: true });
}
