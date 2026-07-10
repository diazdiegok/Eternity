import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { execSync } from "node:child_process";

const url = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url });
const db = new PrismaClient({ adapter });

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
  .finally(() => db.$disconnect());
