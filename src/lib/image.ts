import sharp from "sharp";
import path from "path";
import { ensureStorageDirs, getUploadsDir } from "./storage";

const OUTPUT = 1440;
const WEBP_QUALITY = 96;

export async function optimizeProductImage(buffer: Buffer, filename: string) {
  ensureStorageDirs();
  const base = path.basename(filename, path.extname(filename));
  const outName = `${base}-${Date.now()}.webp`;
  const outPath = path.join(getUploadsDir(), outName);

  await sharp(buffer)
    .rotate()
    .flatten({ background: { r: 250, g: 246, b: 241, alpha: 1 } })
    .resize(OUTPUT, OUTPUT, {
      fit: "contain",
      background: { r: 250, g: 246, b: 241, alpha: 1 },
      position: "centre",
    })
    .sharpen({ sigma: 0.6 })
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toFile(outPath);

  return `/uploads/${outName}`;
}
