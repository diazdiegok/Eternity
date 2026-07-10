import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const orderId = body.orderId ? String(body.orderId) : "";
  const status = body.status === "paid" ? "paid" : "confirmed";

  if (!orderId) {
    return NextResponse.json({ error: "orderId requerido" }, { status: 400 });
  }

  try {
    const order = await db.order.update({
      where: { id: orderId },
      data: { status },
    });
    return NextResponse.json({ ok: true, code: order.code, status: order.status });
  } catch {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }
}
