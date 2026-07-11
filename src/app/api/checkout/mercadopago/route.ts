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
    const discountPercent = body.discountPercent != null ? Number(body.discountPercent) : 0;
    const email = body.email ? String(body.email).trim().toLowerCase() : "";
    const order = await createOrder({
      channel: "mercadopago",
      items,
      customerNote: note,
      customerEmail: email || undefined,
      status: "pending",
      couponCode: body.couponCode ? String(body.couponCode) : null,
      discountPercent,
    });

    if (email) {
      try {
        const { sendOrderReceivedEmail } = await import("@/lib/email");
        await sendOrderReceivedEmail(email, {
          code: order.code,
          createdAt: order.createdAt,
          total: order.total,
          customerNote: order.customerNote,
          couponCode: order.couponCode,
          discountAmount: order.discountAmount,
          items: order.items,
        });
      } catch (mailError) {
        console.error("MP order email error:", mailError);
      }
    }

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const factor =
      subtotal > 0 && order.total < subtotal ? order.total / subtotal : 1;
    const pricedItems =
      factor < 1
        ? items.map((item) => ({
            ...item,
            price: Math.max(1, Math.round(item.price * factor)),
          }))
        : items;

    const preference = await createCheckoutPreference(pricedItems, {
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
