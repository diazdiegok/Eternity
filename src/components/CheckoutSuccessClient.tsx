"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { buildWhatsAppUrl, formatPrice, type CartItem } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/Icons";

type StoredOrder = {
  code?: string;
  items?: CartItem[];
  note?: string;
  coupon?: { code: string; percentOff: number; amount: number } | null;
};

export function CheckoutSuccessClient() {
  const params = useSearchParams();
  const [stored, setStored] = useState<StoredOrder | null>(null);

  useEffect(() => {
    const external = params.get("external_reference");
    if (external) {
      fetch("/api/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: external, status: "paid" }),
      }).catch(() => {});
    }

    try {
      const raw = sessionStorage.getItem("eternity-mp-order");
      if (raw) {
        setStored(JSON.parse(raw));
        sessionStorage.removeItem("eternity-mp-order");
      }
    } catch {
      /* ignore */
    }
  }, [params]);

  const whatsappUrl = useMemo(() => {
    if (!stored?.items?.length) return null;
    return buildWhatsAppUrl({
      items: stored.items,
      note: stored.note,
      discount: stored.coupon || null,
      orderCode: stored.code,
      paid: true,
    });
  }, [stored]);

  const total = useMemo(() => {
    if (!stored?.items?.length) return 0;
    const sub = stored.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const disc = stored.coupon?.amount || 0;
    return Math.max(0, sub - disc);
  }, [stored]);

  return (
    <main className="mx-auto max-w-lg px-5 py-16 text-center sm:py-20">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f5e9] text-2xl text-green-700">
        ✓
      </div>
      <h1 className="mt-5 font-serif text-3xl text-[#4a3b30]">¡Pago recibido!</h1>
      {stored?.code && (
        <p className="mt-3 font-serif text-2xl tracking-wide text-[#4a3b30]">
          {stored.code}
        </p>
      )}
      <p className="mt-4 text-[#6d5c4d]">
        Gracias por tu compra
        {total > 0 ? ` de ${formatPrice(total)}` : ""}. El pedido ya figura como
        pagado.
      </p>
      <p className="mt-2 text-sm text-[#8a7b6e]">
        Si querés, avisanos por WhatsApp que el pago ya está hecho (no hace falta
        adjuntar comprobante: Mercado Pago lo confirma).
      </p>

      <div className="mt-8 flex flex-col items-center gap-3">
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#4a3b30] px-6 py-3 text-sm font-medium text-white"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Avisar por WhatsApp
          </a>
        )}
        <Link
          href="/"
          className="inline-block rounded-full border border-[#e4d5c5] bg-white px-6 py-3 text-sm text-[#5c4a3d]"
        >
          Volver al catálogo
        </Link>
      </div>
    </main>
  );
}
