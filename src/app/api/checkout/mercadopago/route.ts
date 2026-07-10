import { NextRequest, NextResponse } from "next/server";
import { createCheckoutPreference, isMercadoPagoEnabled } from "@/lib/mercadopago";
import type { CartItem } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  if (!isMercadoPagoEnabled()) {
    return NextResponse.json(
      { error: "Mercado Pago no está configurado. Usá WhatsApp para finalizar la compra." },
      { status: 503 }
    );
  }

  const { items } = (await request.json()) as { items: CartItem[] };

  if (!items?.length) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
  }

  try {
    const preference = await createCheckoutPreference(items);
    const useSandbox = process.env.MP_SANDBOX === "true";
    const checkoutUrl = useSandbox ? preference.sandboxInitPoint : preference.initPoint;

    return NextResponse.json({
      id: preference.id,
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
