import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeEmail, isValidEmail } from "@/lib/email";
import { normalizeOrderStatus } from "@/lib/orders";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = String(body.code || "")
      .trim()
      .toUpperCase();
    const email = normalizeEmail(String(body.email || ""));

    if (!code || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Ingresá el N° de orden y el correo del pedido" },
        { status: 400 }
      );
    }

    const order = await db.order.findFirst({
      where: {
        code,
        customerEmail: email,
      },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "No encontramos un pedido con esos datos" },
        { status: 404 }
      );
    }

    const status = normalizeOrderStatus(order.status);
    const statusLabel =
      status === "completed"
        ? "En envío"
        : status === "cancelled"
          ? "Cancelado"
          : "En curso";

    return NextResponse.json({
      code: order.code,
      status,
      statusLabel,
      createdAt: order.createdAt,
      total: order.total,
      shippingCarrier: order.shippingCarrier,
      trackingCode: order.trackingCode,
      items: order.items.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  } catch (error) {
    console.error("Order lookup error:", error);
    return NextResponse.json(
      { error: "No se pudo consultar el pedido" },
      { status: 500 }
    );
  }
}
