import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";

function slugify(name: string) {
  const base =
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "categoria";
  return base;
}

async function uniqueSlug(name: string, excludeId?: string) {
  let slug = slugify(name);
  let n = 0;
  while (true) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const existing = await db.category.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    n += 1;
  }
}

async function syncFromProducts() {
  const rows = await db.product.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  for (const row of rows) {
    const name = row.category?.trim() || "General";
    const found = await db.category.findUnique({ where: { name } });
    if (!found) {
      await db.category.create({
        data: { name, slug: await uniqueSlug(name) },
      });
    }
  }
}

async function renameInPromotions(from: string, to: string) {
  const promotions = await db.promotion.findMany();
  for (const promo of promotions) {
    if (!promo.categories.includes(from)) continue;
    const next = [...new Set(promo.categories.map((c) => (c === from ? to : c)))];
    await db.promotion.update({
      where: { id: promo.id },
      data: { categories: next },
    });
  }
}

async function removeFromPromotions(name: string) {
  const promotions = await db.promotion.findMany();
  for (const promo of promotions) {
    if (!promo.categories.includes(name)) continue;
    const next = promo.categories.filter((c) => c !== name);
    await db.promotion.update({
      where: { id: promo.id },
      data: next.length === 0 ? { active: false, categories: next } : { categories: next },
    });
  }
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  await syncFromProducts();

  const categories = await db.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  const counts = await db.product.groupBy({
    by: ["category"],
    _count: { _all: true },
  });
  const countMap = new Map(counts.map((c) => [c.category, c._count._all]));

  return NextResponse.json(
    categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      count: countMap.get(c.name) || 0,
    }))
  );
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name || "").trim();

  if (!name) {
    return NextResponse.json({ error: "Escribí un nombre" }, { status: 400 });
  }

  const existing = await db.category.findUnique({ where: { name } });
  if (existing) {
    return NextResponse.json(
      { error: "Esa categoría ya existe" },
      { status: 400 }
    );
  }

  const created = await db.category.create({
    data: { name, slug: await uniqueSlug(name) },
  });

  return NextResponse.json({ id: created.id, name: created.name, count: 0 });
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const from = String(body.from || "").trim();
  const to = String(body.to || "").trim();

  if (!from || !to) {
    return NextResponse.json(
      { error: "Indicá el nombre actual y el nuevo" },
      { status: 400 }
    );
  }

  if (from === to) {
    return NextResponse.json({ ok: true, updated: 0, from, to });
  }

  const source = await db.category.findUnique({ where: { name: from } });
  const target = await db.category.findUnique({ where: { name: to } });

  const result = await db.product.updateMany({
    where: { category: from },
    data: { category: to },
  });

  await renameInPromotions(from, to);

  if (target) {
    // Unir duplicados: borrar la categoría origen
    if (source) {
      await db.category.delete({ where: { id: source.id } });
    }
  } else if (source) {
    await db.category.update({
      where: { id: source.id },
      data: { name: to, slug: await uniqueSlug(to, source.id) },
    });
  } else {
    await db.category.create({
      data: { name: to, slug: await uniqueSlug(to) },
    });
  }

  return NextResponse.json({ ok: true, updated: result.count, from, to });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name || "").trim();
  const moveTo = String(body.moveTo || "General").trim() || "General";

  if (!name) {
    return NextResponse.json({ error: "Categoría requerida" }, { status: 400 });
  }

  if (name === moveTo) {
    return NextResponse.json(
      { error: "Elegí otra categoría destino para los productos" },
      { status: 400 }
    );
  }

  const count = await db.product.count({ where: { category: name } });

  if (count > 0) {
    await db.product.updateMany({
      where: { category: name },
      data: { category: moveTo },
    });

    const dest = await db.category.findUnique({ where: { name: moveTo } });
    if (!dest) {
      await db.category.create({
        data: { name: moveTo, slug: await uniqueSlug(moveTo) },
      });
    }
  }

  await removeFromPromotions(name);

  const cat = await db.category.findUnique({ where: { name } });
  if (cat) {
    await db.category.delete({ where: { id: cat.id } });
  }

  return NextResponse.json({
    ok: true,
    deleted: name,
    moved: count,
    moveTo,
  });
}
