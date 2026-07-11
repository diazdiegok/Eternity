import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function ensureDataDir() {
  const dataDir = process.env.DATA_DIR || path.join(root, "data");
  fs.mkdirSync(dataDir, { recursive: true });
  return dataDir;
}

function linkPublicUploads(dataDir) {
  const uploadsDir = path.join(dataDir, "uploads");
  const publicUploads = path.join(root, "public", "uploads");

  fs.mkdirSync(uploadsDir, { recursive: true });

  if (!process.env.DATA_DIR) return;

  // Remove public/uploads so Next does not static-404 before our route handlers.
  if (fs.existsSync(publicUploads)) {
    fs.rmSync(publicUploads, { recursive: true, force: true });
  }
}

console.log("Preparando almacenamiento...");
const dataDir = ensureDataDir();
linkPublicUploads(dataDir);

console.log("Aplicando migraciones...");
execSync("npx prisma migrate deploy", { stdio: "inherit", cwd: root });

console.log("Verificando productos iniciales...");
try {
  execSync("npx tsx prisma/seed-if-empty.mts", { stdio: "inherit", cwd: root });
} catch {
  console.warn("Seed inicial omitido o falló.");
}

console.log("Iniciando servidor...");
execSync("npx next start", { stdio: "inherit", cwd: root });
