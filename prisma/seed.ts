import "dotenv/config";
import { createDb } from "./create-db";

const { db, pool } = createDb();

const IMG = (name: string) => `/images/products/${name}`;

const products = [
  {
    name: "Perla de Leche Materna o ADN",
    description:
      "Perla de leche materna con engarce en acero quirúrgico y cadena de acero quirúrgico.",
    price: 70000,
    category: "Sin Bordes",
    featured: true,
    imageUrl: IMG("perla-leche-materna-adn.webp"),
  },
  {
    name: "Corazón de Leche Materna o ADN",
    description: "Dije corazón con leche materna y cordón umbilical.",
    price: 60000,
    category: "Sin Bordes",
    featured: false,
    imageUrl: IMG("corazon-leche-materna-adn.webp"),
  },
  {
    name: "Gota de Leche, Pelito e Inicial",
    description:
      "Dije en gota de leche materna con diseño de árbol de la vida, pelitos y cordón umbilical. Incluye inicial del bebé o niño.",
    price: 80000,
    category: "Sin Bordes",
    featured: true,
    imageUrl: IMG("gota-leche-pelito-inicial.webp"),
  },
  {
    name: "Corazón de Leche Materna",
    description: "Dije corazón de leche materna completo.",
    price: 85000,
    category: "Sin Bordes",
    featured: false,
    imageUrl: IMG("corazon-leche-materna.webp"),
  },
  {
    name: "Dije Amor de Mamá",
    description: "Dije amor de mamá, bebé y mamá, relleno de leche materna.",
    price: 120000,
    category: "Bordes de Acero",
    featured: true,
    imageUrl: IMG("dije-amor-de-mama.webp"),
  },
  {
    name: "Dije Exagonal, Círculo, Corazón, Gota",
    description:
      "Variedad de modelos de dije en acero quirúrgico relleno de leche materna y ADN.",
    price: 90000,
    category: "Bordes de Acero",
    featured: false,
    imageUrl: IMG("dije-exagonal-circulo-corazon-gota.webp"),
  },
  {
    name: "Pulsera con Charms de Leche Materna y ADN",
    description: "Pulsera de acero quirúrgico con charms de leche materna y ADN.",
    price: 80000,
    category: "Bordes de Acero",
    featured: false,
    imageUrl: IMG("pulsera-charms.webp"),
  },
  {
    name: "Dije con Cenizas Crematorias",
    description: "Variedad de dijes de acero quirúrgico con cenizas crematorias.",
    price: 85000,
    category: "Bordes de Acero",
    featured: false,
    imageUrl: IMG("dije-cenizas-crematorias.webp"),
  },
  {
    name: "Anillo Acero Quirúrgico con Leche",
    description: "Anillo de acero quirúrgico con leche materna.",
    price: 75000,
    category: "Bordes de Acero",
    featured: false,
    imageUrl: IMG("anillo-acero-leche.webp"),
  },
  {
    name: "Dije con Tela, Inicial y Pelito",
    description: "Variedad de modelos de dije en acero quirúrgico con tela y ADN.",
    price: 65000,
    category: "Bordes de Acero",
    featured: false,
    imageUrl: IMG("dije-tela-inicial-pelito.webp"),
  },
  {
    name: "Alianzas en Plata 925",
    description: "Alianzas en plata 925 con leche materna o ADN.",
    price: 230000,
    category: "Plata 925",
    featured: true,
    imageUrl: IMG("alianzas-plata-925.webp"),
  },
  {
    name: "Anillo Corazón e Infinito",
    description: "Anillo corazón e infinito relleno de leche materna o ADN.",
    price: 125000,
    category: "Plata 925",
    featured: true,
    imageUrl: IMG("anillo-corazon-infinito.webp"),
  },
  {
    name: "Anillo Plata 925 Corazón",
    description: "Anillo corazón en plata 925 con leche materna o ADN.",
    price: 100000,
    category: "Plata 925",
    featured: false,
    imageUrl: IMG("anillo-plata-corazon.webp"),
  },
  {
    name: "Cadena Infinito Plata 925",
    description: "Cadena con dije infinito en plata 925.",
    price: 145000,
    category: "Plata 925",
    featured: false,
    imageUrl: IMG("cadena-infinito-plata.webp"),
  },
  {
    name: "Dije Redondo Cúbics Strass",
    description: "Dije circular con strass en plata 925.",
    price: 170000,
    category: "Plata 925",
    featured: false,
    imageUrl: IMG("dije-redondo-strass.webp"),
  },
  {
    name: "Cadena Corazón Plata 925",
    description: "Cadenita corazón plata 925, 16 mm.",
    price: 180000,
    category: "Plata 925",
    featured: true,
    imageUrl: IMG("cadena-corazon-plata-925.webp"),
  },
  {
    name: "Anillo Plata 925 y Oro Infinito",
    description: "Anillo infinito en plata 925 con detalle en oro.",
    price: 140000,
    category: "Plata 925",
    featured: false,
    imageUrl: IMG("anillo-plata-oro-infinito.webp"),
  },
  {
    name: "Anillo Plata 925 y Oro",
    description: "Anillo en plata 925 con detalle en oro.",
    price: 95000,
    category: "Plata 925",
    featured: false,
    imageUrl: IMG("anillo-plata-oro.webp"),
  },
];

async function main() {
  const existing = await db.product.count();
  if (existing > 0) {
    console.log(
      `Ya hay ${existing} productos. Seed cancelado (no se borra nada).`
    );
    return;
  }

  await db.product.createMany({ data: products });
  console.log(`${products.length} productos cargados.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect();
    await pool.end();
  });
