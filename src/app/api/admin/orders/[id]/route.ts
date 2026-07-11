import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

const ALLOWED = ["pending", "completed", "cancelled"];

type ItemInput = {
  productId?: string | null;
  name: string;
  price: number;
  quantity: number;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();

  if (body.status && !ALLOWED.includes(body.status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  if (body.createdAt !== undefined) {
    const parsed = new Date(String(body.createdAt));
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
    }
  }

  let itemsData: ItemInput[] | null = null;
  if (body.items !== undefined) {
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "El pedido necesita al menos un ítem" },
        { status: 400 }
      );
    }
    const mapped: ItemInput[] = body.items.map((item: ItemInput) => ({
      productId: item.productId || null,
      name: String(item.name || "").trim(),
      price: Number(item.price),
      quantity: Math.max(1, Number(item.quantity) || 1),
    }));
    if (mapped.some((i) => !i.name || Number.isNaN(i.price))) {
      return NextResponse.json({ error: "Ítems inválidos" }, { status: 400 });
    }
    itemsData = mapped;
  }

  const total =
    itemsData != null
      ? itemsData.reduce((sum, i) => sum + i.price * i.quantity, 0)
      : undefined;

  const order = await db.$transaction(async (tx) => {
    if (itemsData != null) {
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      await tx.orderItem.createMany({
        data: itemsData.map((item) => ({
          orderId: id,
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      });
    }

    return tx.order.update({
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
        ...(body.createdAt !== undefined && {
          createdAt: new Date(String(body.createdAt)),
        }),
        ...(total !== undefined && { total }),
      },
      include: { items: true },
    });
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
