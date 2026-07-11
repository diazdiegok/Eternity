import sharp from "sharp";
import { db } from "./db";

const OUTPUT = 1440;
const WEBP_QUALITY = 96;

export async function optimizeProductImage(buffer: Buffer) {
  const webp = await sharp(buffer)
    .rotate()
    .flatten({ background: { r: 250, g: 246, b: 241, alpha: 1 } })
    .resize(OUTPUT, OUTPUT, {
      fit: "contain",
      background: { r: 250, g: 246, b: 241, alpha: 1 },
      position: "centre",
    })
    .sharpen({ sigma: 0.6 })
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toBuffer();

  const media = await db.media.create({
    data: {
      mimeType: "image/webp",
      data: webp,
    },
  });

  return `/api/media/${media.id}`;
}
