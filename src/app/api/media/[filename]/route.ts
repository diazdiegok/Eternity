import { NextRequest, NextResponse } from "next/server";
import { readFile, access } from "fs/promises";
import path from "path";
import { getUploadsDir } from "@/lib/storage";

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
};

type RouteContext = { params: Promise<{ filename: string }> };

async function serveUpload(filename: string) {
  const decoded = decodeURIComponent(filename);
  const safeName = path.basename(decoded);

  if (!safeName) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(getUploadsDir(), safeName);

  try {
    await access(filePath);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = await readFile(filePath);
  const ext = path.extname(safeName).toLowerCase();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": CONTENT_TYPES[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { filename } = await context.params;
  return serveUpload(filename);
}
