import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function ensureDataDir() {
  const dataDir = process.env.DATA_DIR || path.join(root, "data");
  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(path.join(dataDir, "uploads"), { recursive: true });
  return dataDir;
}

function warnIfDataNotPersistent(dataDir) {
  if (!process.env.DATA_DIR) return;

  try {
    const mounts = fs.readFileSync("/proc/mounts", "utf8");
    const persistent = mounts
      .split("\n")
      .some((line) => line.includes(dataDir) || line.includes("/opt/render/project/src/data"));

    if (!persistent) {
      console.error("");
      console.error("╔══════════════════════════════════════════════════════════╗");
      console.error("║  ALERTA: no hay disco persistente montado               ║");
      console.error("║  En plan Free de Render los datos se BORRAN en cada     ║");
      console.error("║  deploy / sleep. Pasá a plan Starter y agregá un Disk   ║");
      console.error("║  en /opt/render/project/src/data                        ║");
      console.error("╚══════════════════════════════════════════════════════════╝");
      console.error("");
    } else {
      console.log("Disco persistente detectado en", dataDir);
    }
  } catch {
    // /proc/mounts solo existe en Linux (Render)
  }
}

function clearPublicUploadsShadow() {
  if (!process.env.DATA_DIR) return;

  const publicUploads = path.join(root, "public", "uploads");
  // Remove public/uploads so Next does not static-404 before our route handlers.
  if (fs.existsSync(publicUploads)) {
    fs.rmSync(publicUploads, { recursive: true, force: true });
  }
}

console.log("Preparando almacenamiento...");
const dataDir = ensureDataDir();
warnIfDataNotPersistent(dataDir);
clearPublicUploadsShadow();

console.log("Aplicando migraciones...");
execSync("npx prisma migrate deploy", { stdio: "inherit", cwd: root });

console.log("Verificando productos iniciales...");
try {
  execSync("npx tsx prisma/seed-if-empty.mts", { stdio: "inherit", cwd: root });
} catch {
  console.warn("Seed inicial omitido o falló.");
}

console.log("Restaurando venta manual ET-5464 si falta...");
try {
  execSync("npx tsx prisma/restore-sale-et5464.mts", { stdio: "inherit", cwd: root });
} catch {
  console.warn("Restauración de venta omitida o falló.");
}

console.log("Iniciando servidor...");
execSync("npx next start", { stdio: "inherit", cwd: root });
