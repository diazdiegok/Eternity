import fs from "fs";
import path from "path";

export function getDataDir() {
  return process.env.DATA_DIR || path.join(process.cwd(), "data");
}

export function getUploadsDir() {
  if (process.env.DATA_DIR) {
    return path.join(process.env.DATA_DIR, "uploads");
  }
  return path.join(process.cwd(), "public", "uploads");
}

export function ensureStorageDirs() {
  fs.mkdirSync(getUploadsDir(), { recursive: true });
}

export function linkPublicUploads() {
  if (!process.env.DATA_DIR) return;

  ensureStorageDirs();

  const publicUploads = path.join(process.cwd(), "public", "uploads");

  // En producción con disco persistente, NO usamos public/uploads:
  // Next sirve esa carpeta primero y deja 404 sin llegar a la route.
  // Las imágenes se sirven desde /uploads y /api/media (route handlers).
  if (fs.existsSync(publicUploads)) {
    fs.rmSync(publicUploads, { recursive: true, force: true });
  }
}
