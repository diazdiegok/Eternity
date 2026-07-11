/**
 * Copia datos de Render Postgres → Neon (sin perder productos/ventas/fotos).
 *
 * Uso (PowerShell):
 *   $env:SOURCE_DATABASE_URL="postgresql://...render..."
 *   $env:TARGET_DATABASE_URL="postgresql://...neon...sslmode=require"
 *   node scripts/migrate-db.mjs
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const sourceUrl = process.env.SOURCE_DATABASE_URL;
const targetUrl = process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL;

if (!sourceUrl || !targetUrl) {
  console.error(
    "Faltan SOURCE_DATABASE_URL y TARGET_DATABASE_URL (o DATABASE_URL destino)."
  );
  process.exit(1);
}

if (sourceUrl === targetUrl) {
  console.error("SOURCE y TARGET no pueden ser la misma URL.");
  process.exit(1);
}

const TABLES = ["Category", "Product", "Media", "Order", "OrderItem"];

async function copyTable(source, target, table) {
  const { rows } = await source.query(`SELECT * FROM "${table}"`);
  if (!rows.length) {
    console.log(`  ${table}: 0 filas`);
    return 0;
  }

  const cols = Object.keys(rows[0]);
  const colList = cols.map((c) => `"${c}"`).join(", ");
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");

  let inserted = 0;
  for (const row of rows) {
    const values = cols.map((c) => row[c]);
    await target.query(
      `INSERT INTO "${table}" (${colList}) VALUES (${placeholders})
       ON CONFLICT DO NOTHING`,
      values
    );
    inserted++;
  }
  console.log(`  ${table}: ${inserted} filas`);
  return inserted;
}

async function main() {
  console.log("1) Aplicando migraciones en Neon...");
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    cwd: root,
    env: { ...process.env, DATABASE_URL: targetUrl },
  });

  const source = new pg.Client({
    connectionString: sourceUrl,
    ssl: sourceUrl.includes("sslmode=disable")
      ? false
      : { rejectUnauthorized: false },
  });
  const target = new pg.Client({
    connectionString: targetUrl,
    ssl: { rejectUnauthorized: false },
  });

  await source.connect();
  await target.connect();
  console.log("2) Copiando tablas...");

  try {
    await target.query("BEGIN");
    // Orden: padres antes que hijos
    for (const table of ["Category", "Media", "Product", "Order", "OrderItem"]) {
      await copyTable(source, target, table);
    }
    await target.query("COMMIT");
    console.log("Listo. Datos copiados a Neon.");
  } catch (err) {
    await target.query("ROLLBACK");
    throw err;
  } finally {
    await source.end();
    await target.end();
  }
}

main().catch((err) => {
  console.error("Error en migración:", err);
  process.exit(1);
});
