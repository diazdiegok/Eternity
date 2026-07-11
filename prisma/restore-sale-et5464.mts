import "dotenv/config";
import { createDb } from "./create-db";

const CODE = "ET-5464";
const PRODUCT_NAME = "Dije con Tela, Inicial y Pelito";
const TOTAL = 65000;

const { db, pool } = createDb();

async function main() {
  const existing = await db.order.findUnique({ where: { code: CODE } });
  if (existing) {
    console.log(`Venta ${CODE} ya existe, nada que restaurar.`);
    return;
  }

  const product = await db.product.findFirst({
    where: { name: PRODUCT_NAME },
  });

  if (!product) {
    console.warn(
      `No se encontró el producto "${PRODUCT_NAME}". No se pudo restaurar ${CODE}.`
    );
    return;
  }

  await db.order.create({
    data: {
      code: CODE,
      channel: "manual",
      status: "confirmed",
      customerName: null,
      customerPhone: null,
      customerNote: "",
      total: TOTAL,
      items: {
        create: [
          {
            productId: product.id,
            name: product.name,
            price: TOTAL,
            quantity: 1,
          },
        ],
      },
    },
  });

  console.log(
    `Venta restaurada: ${CODE} · Manual · Confirmado · ${PRODUCT_NAME} · $ ${TOTAL.toLocaleString("es-AR")}`
  );
}

main()
  .catch((err) => {
    console.error("Error restaurando venta:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
    await pool.end();
  });
