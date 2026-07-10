import { NextRequest, NextResponse } from "next/server";
import { mkdir } from "fs/promises";
import { isAdminAuthenticated } from "@/lib/auth";
import { optimizeProductImage } from "@/lib/image";
import { ensureStorageDirs, getUploadsDir } from "@/lib/storage";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Solo se permiten imágenes" }, { status: 400 });
  }

  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "Máximo 15 MB" }, { status: 400 });
  }

  ensureStorageDirs();
  await mkdir(getUploadsDir(), { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await optimizeProductImage(buffer, file.name);

  return NextResponse.json({ url });
}
