import Link from "next/link";
import { SITE } from "@/lib/config";

export default function CheckoutErrorPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-serif text-3xl text-stone-800">No se pudo completar el pago</h1>
      <p className="mt-4 text-stone-600">
        Podés intentar de nuevo o finalizar tu pedido por WhatsApp.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-full bg-stone-900 px-6 py-3 text-white">
          Volver al catálogo
        </Link>
        <a
          href={`https://wa.me/${SITE.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-[#25D366] px-6 py-3 text-white"
        >
          WhatsApp
        </a>
      </div>
    </main>
  );
}
