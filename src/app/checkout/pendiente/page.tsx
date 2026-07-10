import Link from "next/link";

export default function CheckoutPendingPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-serif text-3xl text-stone-800">Pago pendiente</h1>
      <p className="mt-4 text-stone-600">
        Tu pago está en proceso. Te avisamos cuando se acredite.
      </p>
      <Link href="/" className="mt-8 inline-block rounded-full bg-stone-900 px-6 py-3 text-white">
        Volver al catálogo
      </Link>
    </main>
  );
}
