import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();

  const product = await db.product.update({
    where: { id },
    data: {
      ...(body.name != null && { name: String(body.name).trim() }),
      ...(body.description != null && { description: String(body.description).trim() }),
      ...(body.price != null && { price: Number(body.price) }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl || null }),
      ...(body.category != null && { category: String(body.category).trim() }),
      ...(body.featured != null && { featured: Boolean(body.featured) }),
      ...(body.active != null && { active: Boolean(body.active) }),
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  await db.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
