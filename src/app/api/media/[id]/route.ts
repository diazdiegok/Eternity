import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!id || id.includes("/") || id.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const media = await db.media.findUnique({ where: { id } });
  if (!media) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(Buffer.from(media.data), {
    headers: {
      "Content-Type": media.mimeType || "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
