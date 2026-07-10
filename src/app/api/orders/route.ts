import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";
import type { CartItem } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = body.items as CartItem[];
    const channel = body.channel as "whatsapp" | "mercadopago";

    if (!items?.length || !["whatsapp", "mercadopago"].includes(channel)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const order = await createOrder({
      channel,
      items,
      customerNote: body.note ? String(body.note) : "",
      status: "pending",
    });

    return NextResponse.json({
      id: order.id,
      code: order.code,
      total: order.total,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "No se pudo registrar el pedido" }, { status: 500 });
  }
}
