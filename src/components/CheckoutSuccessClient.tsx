"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export function CheckoutSuccessClient() {
  const params = useSearchParams();

  useEffect(() => {
    const external = params.get("external_reference");
    if (!external) return;
    fetch("/api/orders/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: external, status: "paid" }),
    }).catch(() => {});
  }, [params]);

  return (
    <main className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-serif text-3xl text-[#4a3b30]">¡Pago recibido!</h1>
      <p className="mt-4 text-[#6d5c4d]">
        Gracias por tu compra. Te vamos a contactar para coordinar la entrega.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-[#4a3b30] px-6 py-3 text-white"
      >
        Volver al catálogo
      </Link>
    </main>
  );
}
