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
  const uploadsDir = getUploadsDir();

  if (fs.existsSync(publicUploads)) {
    const stat = fs.lstatSync(publicUploads);
    if (stat.isSymbolicLink()) {
      fs.unlinkSync(publicUploads);
    } else {
      // Carpeta real (p. ej. con .gitkeep): bloquea el symlink y las
      // imágenes quedan en DATA_DIR pero no se sirven desde /uploads.
      fs.rmSync(publicUploads, { recursive: true, force: true });
    }
  }

  fs.symlinkSync(uploadsDir, publicUploads, "dir");
}
