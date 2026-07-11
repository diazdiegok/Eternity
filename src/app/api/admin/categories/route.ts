import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";

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

  const result = await db.product.updateMany({
    where: { category: from },
    data: { category: to },
  });

  // Actualizar categorías dentro de promociones activas
  const promotions = await db.promotion.findMany();
  for (const promo of promotions) {
    if (!promo.categories.includes(from)) continue;
    const next = [
      ...new Set(promo.categories.map((c) => (c === from ? to : c))),
    ];
    await db.promotion.update({
      where: { id: promo.id },
      data: { categories: next },
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
  }

  const promotions = await db.promotion.findMany();
  for (const promo of promotions) {
    if (!promo.categories.includes(name)) continue;
    const next = promo.categories.filter((c) => c !== name);
    if (next.length === 0) {
      await db.promotion.update({
        where: { id: promo.id },
        data: { active: false, categories: next },
      });
    } else {
      await db.promotion.update({
        where: { id: promo.id },
        data: { categories: next },
      });
    }
  }

  return NextResponse.json({
    ok: true,
    deleted: name,
    moved: count,
    moveTo,
  });
}
