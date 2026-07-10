import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalogDir = path.join(__dirname, "../public/images/catalog");
const outDir = path.join(__dirname, "../public/images/products");
const OUTPUT_SIZE = 1080;

async function cropGrid(
  sourceFile,
  prefix,
  rows,
  cols,
  headerRatio = 0.18
) {
  const source = path.join(catalogDir, sourceFile);
  const meta = await sharp(source).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const top = Math.round(height * headerRatio);
  const gridHeight = height - top;
  const cellW = Math.floor(width / cols);
  const cellH = Math.floor(gridHeight / rows);

  const positions = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
    [0, 2],
    [1, 2],
  ];

  let index = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      index += 1;
      const left = col * cellW;
      const cropTop = top + row * cellH;
      const outPath = path.join(outDir, `${prefix}-${index}.webp`);

      await sharp(source)
        .extract({
          left,
          top: cropTop,
          width: cellW,
          height: cellH,
        })
        .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
          fit: "cover",
          position: "centre",
        })
        .webp({ quality: 92 })
        .toFile(outPath);

      console.log(`Created ${outPath}`);
    }
  }
}

async function cropLogo() {
  const source = path.join(__dirname, "../public/logo.png");
  const outPath = path.join(__dirname, "../public/logo-icon.webp");

  await sharp(source)
    .resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95 })
    .toFile(outPath);

  console.log(`Created ${outPath}`);
}

async function main() {
  await cropLogo();
  await cropGrid("sin-bordes.png", "sin-bordes", 2, 2);
  await cropGrid("bordes-acero-1.png", "bordes-acero-1", 2, 2);
  await cropGrid("bordes-acero-2.png", "bordes-acero-2", 1, 2, 0.22);
  await cropGrid("plata-925-1.png", "plata-925-1", 2, 2);
  await cropGrid("plata-925-2.png", "plata-925-2", 2, 2);
  await cropGrid("mascotas.png", "mascotas", 1, 2, 0.22);
}

main().catch(console.error);
