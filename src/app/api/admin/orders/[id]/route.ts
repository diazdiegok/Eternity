import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

const ALLOWED = ["pending", "confirmed", "paid", "completed", "cancelled"];

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();

  if (body.status && !ALLOWED.includes(body.status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const order = await db.order.update({
    where: { id },
    data: {
      ...(body.status != null && { status: String(body.status) }),
      ...(body.customerName !== undefined && {
        customerName: body.customerName ? String(body.customerName) : null,
      }),
      ...(body.customerPhone !== undefined && {
        customerPhone: body.customerPhone ? String(body.customerPhone) : null,
      }),
      ...(body.customerNote !== undefined && {
        customerNote: String(body.customerNote || ""),
      }),
    },
    include: { items: true },
  });

  return NextResponse.json(order);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  await db.order.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
