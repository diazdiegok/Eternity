import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.resolve(
  __dirname,
  "../../../../.cursor/projects/c-Users-diego-Desktop-HUEVOS/assets"
);
const PUBLIC = path.join(__dirname, "../public");
const PRODUCTS = path.join(PUBLIC, "images/products");

const OUTPUT = 1440;
const WEBP_QUALITY = 96;
const CREAM = { r: 250, g: 246, b: 241, alpha: 1 };

async function trimDarkBars(inputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const threshold = 50;

  function rowIsDark(y) {
    let dark = 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (lum < threshold) dark++;
    }
    return dark / width > 0.85;
  }

  function colIsDark(x, y0, y1) {
    let dark = 0;
    const span = y1 - y0 + 1;
    for (let y = y0; y <= y1; y++) {
      const i = (y * width + x) * channels;
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (lum < threshold) dark++;
    }
    return dark / span > 0.85;
  }

  let top = 0;
  while (top < height && rowIsDark(top)) top++;

  let bottom = height - 1;
  while (bottom > top && rowIsDark(bottom)) bottom--;

  let left = 0;
  while (left < width && colIsDark(left, top, bottom)) left++;

  let right = width - 1;
  while (right > left && colIsDark(right, top, bottom)) right--;

  const pad = Math.round(Math.min(width, height) * 0.015);
  const extractLeft = Math.max(0, left - pad);
  const extractTop = Math.max(0, top - pad);
  const extractWidth = Math.min(width - extractLeft, right - left + 1 + pad * 2);
  const extractHeight = Math.min(height - extractTop, bottom - top + 1 + pad * 2);

  if (extractWidth < width * 0.3 || extractHeight < height * 0.3) {
    return sharp(inputPath);
  }

  return sharp(inputPath).extract({
    left: extractLeft,
    top: extractTop,
    width: extractWidth,
    height: extractHeight,
  });
}

async function optimizeImage(inputPath, outputPath, options = {}) {
  const { crop, fit = "contain", trimUi = false } = options;
  let pipeline = sharp(inputPath);

  if (crop) {
    const meta = await sharp(inputPath).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    pipeline = pipeline.extract({
      left: Math.round(w * crop.left),
      top: Math.round(h * crop.top),
      width: Math.round(w * crop.width),
      height: Math.round(h * crop.height),
    });
  }

  if (trimUi) {
    const trimmed = await trimDarkBars(await pipeline.toBuffer());
    pipeline = trimmed;
  }

  pipeline = pipeline.rotate().flatten({ background: CREAM }).sharpen({ sigma: 0.6 });

  pipeline = pipeline.resize(OUTPUT, OUTPUT, {
    fit: "contain",
    background: CREAM,
    position: "centre",
  });

  await pipeline.webp({ quality: WEBP_QUALITY, effort: 6 }).toFile(outputPath);
  console.log(`✓ ${path.basename(outputPath)}`);
}

const productImages = [
  {
    src: "c__Users_diego_AppData_Roaming_Cursor_User_workspaceStorage_aeac9aba557bf238fb3c57a751b597e3_images_image-9d695566-bdb9-4a64-afe6-7d7ba4056d27.png",
    out: "perla-leche-materna-adn.webp",
  },
  {
    src: "c__Users_diego_AppData_Roaming_Cursor_User_workspaceStorage_aeac9aba557bf238fb3c57a751b597e3_images_image-fd764540-c19b-4791-9b41-11253ace60e8.png",
    out: "gota-leche-pelito-inicial.webp",
  },
  {
    src: "c__Users_diego_AppData_Roaming_Cursor_User_workspaceStorage_aeac9aba557bf238fb3c57a751b597e3_images_image-baf88236-93f5-4b57-88fd-dca7cbaa7a8d.png",
    out: "dije-amor-de-mama.webp",
  },
  {
    src: "c__Users_diego_AppData_Roaming_Cursor_User_workspaceStorage_aeac9aba557bf238fb3c57a751b597e3_images_image-25fb4212-1b55-46a1-98d7-1881a97efae8.png",
    out: "alianzas-plata-925.webp",
  },
  {
    src: "c__Users_diego_AppData_Roaming_Cursor_User_workspaceStorage_aeac9aba557bf238fb3c57a751b597e3_images_image-c642c3ff-b62a-4f34-81b4-1f8324c2ec96.png",
    out: "anillo-corazon-infinito.webp",
  },
  {
    src: "c__Users_diego_AppData_Roaming_Cursor_User_workspaceStorage_aeac9aba557bf238fb3c57a751b597e3_images_image-bb824790-aba8-4ff8-b7d3-18f059b25328.png",
    out: "cadena-corazon-plata-925.webp",
    trimUi: true,
  },
  {
    src: "c__Users_diego_AppData_Roaming_Cursor_User_workspaceStorage_aeac9aba557bf238fb3c57a751b597e3_images_image-1089f37a-6d7c-4b84-b023-b1fa01b10466.png",
    out: "corazon-leche-materna-adn.webp",
  },
  {
    src: "c__Users_diego_AppData_Roaming_Cursor_User_workspaceStorage_aeac9aba557bf238fb3c57a751b597e3_images_image-9c82d888-4a5e-41b2-b4f2-114653454474.png",
    out: "corazon-leche-materna.webp",
  },
  {
    src: "c__Users_diego_AppData_Roaming_Cursor_User_workspaceStorage_aeac9aba557bf238fb3c57a751b597e3_images_image-487f3bde-1abe-44b3-8515-acc4010edcda.png",
    out: "dije-exagonal-circulo-corazon-gota.webp",
  },
  {
    src: "c__Users_diego_AppData_Roaming_Cursor_User_workspaceStorage_aeac9aba557bf238fb3c57a751b597e3_images_image-bf55029a-2aca-4bb6-81c0-b8aee40104eb.png",
    out: "pulsera-charms.webp",
  },
  {
    src: "c__Users_diego_AppData_Roaming_Cursor_User_workspaceStorage_aeac9aba557bf238fb3c57a751b597e3_images_image-18020d8e-35c1-45a6-ab6c-32b888d82a63.png",
    out: "dije-cenizas-crematorias.webp",
  },
  {
    src: "c__Users_diego_AppData_Roaming_Cursor_User_workspaceStorage_aeac9aba557bf238fb3c57a751b597e3_images_image-3afde5b4-306a-4b5d-ae20-a01e4cd144e5.png",
    out: "anillo-acero-leche.webp",
  },
  {
    src: "c__Users_diego_AppData_Roaming_Cursor_User_workspaceStorage_aeac9aba557bf238fb3c57a751b597e3_images_image-002ebbd0-8bd4-4383-8338-5750cc5b9455.png",
    out: "dije-tela-inicial-pelito.webp",
  },
  {
    src: "c__Users_diego_AppData_Roaming_Cursor_User_workspaceStorage_aeac9aba557bf238fb3c57a751b597e3_images_image-8071b41a-e185-4d26-92db-b76e94fd37b4.png",
    out: "anillo-plata-corazon.webp",
  },
  {
    src: "c__Users_diego_AppData_Roaming_Cursor_User_workspaceStorage_aeac9aba557bf238fb3c57a751b597e3_images_image-e2e9a46d-0ee9-4f25-8a89-37c70525830a.png",
    out: "cadena-infinito-plata.webp",
  },
  {
    src: "c__Users_diego_AppData_Roaming_Cursor_User_workspaceStorage_aeac9aba557bf238fb3c57a751b597e3_images_image-bd252e38-18b1-4f81-a77f-5c4a4ce09f83.png",
    out: "dije-redondo-strass.webp",
    trimUi: true,
  },
  {
    src: "c__Users_diego_AppData_Roaming_Cursor_User_workspaceStorage_aeac9aba557bf238fb3c57a751b597e3_images_image-eb1b4516-efee-4357-b8fc-541204130eac.png",
    out: "anillo-plata-oro-infinito.webp",
    trimUi: true,
  },
  {
    src: "c__Users_diego_AppData_Roaming_Cursor_User_workspaceStorage_aeac9aba557bf238fb3c57a751b597e3_images_image-5c79a6de-3595-41b5-b9c3-157c06a48377.png",
    out: "anillo-plata-oro.webp",
    trimUi: true,
  },
];

async function processLogo() {
  const logoSrc =
    "c__Users_diego_AppData_Roaming_Cursor_User_workspaceStorage_aeac9aba557bf238fb3c57a751b597e3_images_image-c3e666fc-4399-453e-9ca2-374074f0dd74.png";
  const input = path.join(ASSETS, logoSrc);
  const meta = await sharp(input).metadata();
  const w = meta.width ?? 1024;
  const h = meta.height ?? 1024;

  const cropW = Math.round(w * 0.9);
  const cropH = Math.round(h * 0.9);
  const left = Math.round(w * 0.04);
  const top = Math.round(h * 0.03);

  const base = sharp(input)
    .extract({ left, top, width: cropW, height: cropH })
    .flatten({ background: CREAM });

  await base
    .clone()
    .resize(900, 900, { fit: "contain", background: CREAM })
    .webp({ quality: 98 })
    .toFile(path.join(PUBLIC, "logo.webp"));

  await base
    .clone()
    .resize(512, 512, { fit: "contain", background: CREAM })
    .webp({ quality: 98 })
    .toFile(path.join(PUBLIC, "logo-icon.webp"));

  await base
    .clone()
    .resize(120, 120, { fit: "contain", background: CREAM })
    .webp({ quality: 98 })
    .toFile(path.join(PUBLIC, "logo-header.webp"));

  // Logo hero: grande y redondo para portada
  await base
    .clone()
    .resize(560, 560, { fit: "contain", background: CREAM })
    .webp({ quality: 98 })
    .toFile(path.join(PUBLIC, "logo-hero.webp"));

  console.log("✓ logo.webp, logo-icon.webp, logo-header.webp, logo-hero.webp");
}

async function main() {
  fs.mkdirSync(PRODUCTS, { recursive: true });
  await processLogo();

  for (const item of productImages) {
    const input = path.join(ASSETS, item.src);
    const output = path.join(PRODUCTS, item.out);
    await optimizeImage(input, output, {
      crop: item.crop,
      trimUi: item.trimUi,
    });
  }

  console.log(`\n${productImages.length} productos optimizados a ${OUTPUT}px`);
}

main().catch(console.error);
