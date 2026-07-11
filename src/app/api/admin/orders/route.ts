import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { createOrder } from "@/lib/orders";
import type { CartItem } from "@/lib/whatsapp";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const orders = await db.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const items = body.items as CartItem[];

    if (!items?.length) {
      return NextResponse.json({ error: "Agregá al menos un producto" }, { status: 400 });
    }

    const order = await createOrder({
      channel: "manual",
      items,
      customerName: body.customerName ? String(body.customerName) : undefined,
      customerPhone: body.customerPhone ? String(body.customerPhone) : undefined,
      customerNote: body.customerNote ? String(body.customerNote) : "",
      status: body.status || "completed",
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Admin create order:", error);
    return NextResponse.json({ error: "No se pudo crear la venta" }, { status: 500 });
  }
}
