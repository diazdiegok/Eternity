import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function cropLogo() {
  const source = path.join(__dirname, "../public/logo.png");
  const outPath = path.join(__dirname, "../public/logo-icon.webp");

  const meta = await sharp(source).metadata();
  const size = Math.min(meta.width ?? 512, meta.height ?? 512);
  const left = Math.round(((meta.width ?? size) - size) / 2);
  const top = Math.round(((meta.height ?? size) - size) / 2);

  await sharp(source)
    .extract({ left, top, width: size, height: size })
    .resize(512, 512, { fit: "cover" })
    .webp({ quality: 95 })
    .toFile(outPath);

  console.log(`Logo optimizado: ${outPath}`);
}

cropLogo().catch(console.error);
