import { NextRequest, NextResponse } from "next/server";
import { createCheckoutPreference, isMercadoPagoEnabled } from "@/lib/mercadopago";
import { createOrder } from "@/lib/orders";
import { db } from "@/lib/db";
import type { CartItem } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  if (!isMercadoPagoEnabled()) {
    return NextResponse.json(
      { error: "Mercado Pago no está configurado. Usá WhatsApp para finalizar la compra." },
      { status: 503 }
    );
  }

  const body = await request.json();
  const items = body.items as CartItem[];
  const note = body.note ? String(body.note) : "";

  if (!items?.length) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
  }

  try {
    const order = await createOrder({
      channel: "mercadopago",
      items,
      customerNote: note,
      status: "pending",
    });

    const preference = await createCheckoutPreference(items, {
      orderId: order.id,
      orderCode: order.code,
    });

    await db.order.update({
      where: { id: order.id },
      data: { mpPreferenceId: preference.id || null },
    });

    const useSandbox = process.env.MP_SANDBOX === "true";
    const checkoutUrl = useSandbox ? preference.sandboxInitPoint : preference.initPoint;

    return NextResponse.json({
      id: preference.id,
      orderId: order.id,
      orderCode: order.code,
      checkoutUrl,
    });
  } catch (error) {
    console.error("Mercado Pago error:", error);
    return NextResponse.json(
      { error: "No se pudo crear el pago. Intentá por WhatsApp." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ enabled: isMercadoPagoEnabled() });
}
