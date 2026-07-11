import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL no está definida. Configurá el Postgres de Render.");
  process.exit(1);
}

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
