import type { Metadata } from "next";
import Link from "next/link";
import { OrderLookupForm } from "@/components/OrderLookupForm";
import { TruckIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Consultar mi pedido | Eternity Recuerdos",
  description: "Consultá el estado de tu pedido con el N° de orden y tu correo.",
};

export default function MiPedidoPage() {
  return (
    <main className="relative min-h-[70vh] overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 50% at 15% 10%, #d4b89644, transparent 55%), radial-gradient(ellipse 60% 45% at 90% 80%, #c9956a22, transparent 50%)",
        }}
      />

      <section className="relative mx-auto max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
        <Link
          href="/"
          className="text-sm text-[#8a7b6e] transition hover:text-[#4a3b30]"
        >
          ← Volver al catálogo
        </Link>

        <div className="mt-6 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#4a3b30] text-[#f7f1ea]">
            <TruckIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#a67c52]">
              Seguimiento
            </p>
            <h1 className="mt-1 font-serif text-3xl text-[#4a3b30] sm:text-4xl">
              Consultar mi pedido
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6d5c4d] sm:text-base">
              Ingresá el N° de orden y el correo con el que finalizaste la compra
              para ver el estado, el detalle y el seguimiento del envío.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <OrderLookupForm />
        </div>
      </section>
    </main>
  );
}
