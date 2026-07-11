import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaymentById, isMercadoPagoEnabled } from "@/lib/mercadopago";

/**
 * Webhook de Mercado Pago.
 * Marca el pedido como completed cuando el pago está approved.
 */
export async function POST(request: NextRequest) {
  if (!isMercadoPagoEnabled()) {
    return NextResponse.json({ ok: true });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const topic = String(body.type || body.topic || "");
    const dataId = String(body.data?.id || body.id || "");

    const url = new URL(request.url);
    const qTopic = url.searchParams.get("topic") || url.searchParams.get("type");
    const qId = url.searchParams.get("id") || url.searchParams.get("data.id");

    const finalTopic = topic || qTopic || "";
    const paymentId = dataId || qId || "";

    if (!paymentId) {
      return NextResponse.json({ ok: true });
    }

    if (finalTopic && !String(finalTopic).toLowerCase().includes("payment")) {
      return NextResponse.json({ ok: true });
    }

    const payment = await getPaymentById(paymentId);
    const status = String(payment.status || "");
    const orderId = String(payment.external_reference || "");

    if (!orderId) {
      console.warn("MP webhook: pago sin external_reference", paymentId);
      return NextResponse.json({ ok: true });
    }

    if (status === "approved") {
      const order = await db.order.update({
        where: { id: orderId },
        data: { status: "completed" },
      });
      console.log(`MP: pedido ${order.code} completed (pago ${paymentId})`);
    } else if (status === "rejected" || status === "cancelled") {
      await db.order.update({
        where: { id: orderId },
        data: { status: "cancelled" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("MP webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
