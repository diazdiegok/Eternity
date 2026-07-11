import "dotenv/config";
import { execSync } from "node:child_process";
import { createDb } from "./create-db";

const { db, pool } = createDb();

async function main() {
  const count = await db.product.count();
  if (count > 0) {
    console.log(`Base con ${count} productos, seed omitido.`);
    return;
  }

  console.log("Base vacía, cargando productos iniciales...");
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
}

main()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect();
    await pool.end();
  });
