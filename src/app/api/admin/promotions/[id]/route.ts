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

  const promotion = await db.promotion.update({
    where: { id },
    data: {
      ...(body.active != null && { active: Boolean(body.active) }),
      ...(body.name != null && { name: String(body.name).trim() }),
    },
  });

  return NextResponse.json(promotion);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  await db.promotion.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
