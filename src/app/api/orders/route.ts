import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";
import {
  isValidEmail,
  normalizeEmail,
  sendOrderReceivedEmail,
} from "@/lib/email";
import type { CartItem } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = body.items as CartItem[];
    const channel = body.channel as "whatsapp" | "mercadopago";
    const email = normalizeEmail(String(body.email || ""));

    if (!items?.length || !["whatsapp", "mercadopago"].includes(channel)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Ingresá un correo válido para recibir el pedido" },
        { status: 400 }
      );
    }

    const order = await createOrder({
      channel,
      items,
      customerEmail: email,
      customerNote: body.note ? String(body.note) : "",
      status: "pending",
      couponCode: body.couponCode ? String(body.couponCode) : null,
      discountPercent:
        body.discountPercent != null ? Number(body.discountPercent) : 0,
    });

    const mail = await sendOrderReceivedEmail(email, {
      code: order.code,
      createdAt: order.createdAt,
      total: order.total,
      customerNote: order.customerNote,
      couponCode: order.couponCode,
      discountAmount: order.discountAmount,
      items: order.items,
    });

    return NextResponse.json({
      id: order.id,
      code: order.code,
      total: order.total,
      email,
      emailSent: mail.ok,
      emailSkipped: mail.skipped,
      emailError: mail.ok ? null : mail.error,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "No se pudo registrar el pedido" },
      { status: 500 }
    );
  }
}
