// Photo upload for reviews. Issues a Vercel Blob client token, but only
// after verifying the requester owns the order they claim. Without this
// gate, anyone could upload images to our Blob store.

import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { prisma } from "@/lib/db";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const orderNumber = (url.searchParams.get("orderNumber") || "").trim().toUpperCase();
  const email = (url.searchParams.get("email") || "").trim().toLowerCase();

  if (!orderNumber || !email) {
    return NextResponse.json({ error: "Missing order number or email" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { orderNumber, customerEmail: email },
    select: { id: true }
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found for that email" }, { status: 403 });
  }

  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
        addRandomSuffix: true,
        maximumSizeInBytes: MAX_BYTES,
        tokenPayload: JSON.stringify({ orderId: order.id })
      }),
      onUploadCompleted: async () => {}
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 400 }
    );
  }
}
