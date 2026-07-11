import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  isValidEmail,
  normalizeEmail,
  sendOrderShippedEmail,
} from "@/lib/email";

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

  const existing = await db.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
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

  const nextStatus =
    body.status != null ? String(body.status) : existing.status;
  const shippingCarrier =
    body.shippingCarrier !== undefined
      ? String(body.shippingCarrier || "").trim() || null
      : existing.shippingCarrier;
  const trackingCode =
    body.trackingCode !== undefined
      ? String(body.trackingCode || "").trim() || null
      : existing.trackingCode;

  if (nextStatus === "completed") {
    if (!shippingCarrier || !trackingCode) {
      return NextResponse.json(
        {
          error:
            "Para marcar Completado cargá empresa de envío y N° de seguimiento",
        },
        { status: 400 }
      );
    }
  }

  let customerEmail = existing.customerEmail;
  if (body.customerEmail !== undefined) {
    const raw = String(body.customerEmail || "").trim();
    if (raw && !isValidEmail(raw)) {
      return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
    }
    customerEmail = raw ? normalizeEmail(raw) : null;
  }

  const becomingCompleted =
    nextStatus === "completed" && existing.status !== "completed";

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
        ...(body.customerEmail !== undefined && { customerEmail }),
        ...(body.customerNote !== undefined && {
          customerNote: String(body.customerNote || ""),
        }),
        ...(body.createdAt !== undefined && {
          createdAt: new Date(String(body.createdAt)),
        }),
        ...(body.shippingCarrier !== undefined && { shippingCarrier }),
        ...(body.trackingCode !== undefined && { trackingCode }),
        ...(total !== undefined && { total }),
      },
      include: { items: true },
    });
  });

  let emailSent = false;
  if (
    becomingCompleted &&
    order.customerEmail &&
    order.shippingCarrier &&
    order.trackingCode
  ) {
    try {
      await sendOrderShippedEmail(order.customerEmail, {
        code: order.code,
        createdAt: order.createdAt,
        total: order.total,
        customerNote: order.customerNote,
        couponCode: order.couponCode,
        discountAmount: order.discountAmount,
        items: order.items,
        shippingCarrier: order.shippingCarrier,
        trackingCode: order.trackingCode,
      });
      emailSent = true;
    } catch (mailError) {
      console.error("Shipping email error:", mailError);
    }
  }

  return NextResponse.json({ ...order, emailSent });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  await db.order.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
