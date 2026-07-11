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

  const data: {
    code?: string;
    percentOff?: number;
    active?: boolean;
  } = {};

  if (body.code != null) {
    data.code = String(body.code).trim().toUpperCase().replace(/\s+/g, "");
  }
  if (body.percentOff != null) {
    const percentOff = Number(body.percentOff);
    if (!Number.isFinite(percentOff) || percentOff <= 0 || percentOff > 100) {
      return NextResponse.json(
        { error: "El descuento debe ser entre 1 y 100%" },
        { status: 400 }
      );
    }
    data.percentOff = percentOff;
  }
  if (body.active != null) data.active = Boolean(body.active);

  try {
    const coupon = await db.coupon.update({ where: { id }, data });
    return NextResponse.json(coupon);
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  await db.coupon.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
