"use client";

import { FormEvent, useState } from "react";
import { formatPrice } from "@/lib/whatsapp";

type LookupResult = {
  code: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  total: number;
  shippingCarrier: string | null;
  trackingCode: string | null;
  items: { name: string; price: number; quantity: number }[];
};

export function OrderLookupButton() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);

  function close() {
    setOpen(false);
    setError("");
    setResult(null);
  }

  async function handleLookup(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se encontró el pedido");
        return;
      }
      setResult(data);
    } catch {
      setError("No se pudo consultar el pedido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-[#e4d5c5] bg-white/80 px-3 py-2 text-xs font-medium text-[#5c4a3d] transition hover:border-[#c9b29a] hover:text-[#4a3b30] sm:px-4 sm:text-sm"
      >
        Mi pedido
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-[#4a3b30]/40 backdrop-blur-[2px]"
            onClick={close}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-[#e4d5c5] bg-[#f7f1ea] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-serif text-2xl text-[#4a3b30]">
                  Consultar pedido
                </h3>
                <p className="mt-1 text-sm text-[#8a7b6e]">
                  Ingresá el N° de orden y el correo con el que compraste.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#6d5c4d] hover:bg-[#efe4d8]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLookup} className="mt-5 space-y-3">
              <label className="block text-sm font-medium text-[#5c4a3d]">
                N° de orden
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ET-1234"
                  className="mt-1.5 w-full rounded-xl border border-[#e8ddd3] bg-white px-3 py-2.5 text-[#5c4a3d] outline-none focus:border-[#c9956a]"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-[#5c4a3d]">
                Correo
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="mt-1.5 w-full rounded-xl border border-[#e8ddd3] bg-white px-3 py-2.5 text-[#5c4a3d] outline-none focus:border-[#c9956a]"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#4a3b30] py-3 text-sm font-medium text-white disabled:opacity-60"
              >
                {loading ? "Buscando..." : "Ver estado"}
              </button>
            </form>

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            {result && (
              <div className="mt-5 rounded-2xl border border-[#e4d5c5] bg-white p-4">
                <p className="font-serif text-xl text-[#4a3b30]">{result.code}</p>
                <p className="mt-1 text-sm font-medium text-[#a67c52]">
                  Estado: {result.statusLabel}
                </p>
                <p className="mt-1 text-xs text-[#8a7b6e]">
                  {new Date(result.createdAt).toLocaleString("es-AR")}
                </p>
                <ul className="mt-3 space-y-1 text-sm text-[#6d5c4d]">
                  {result.items.map((item, i) => (
                    <li key={`${item.name}-${i}`}>
                      {item.quantity}× {item.name}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 font-medium text-[#4a3b30]">
                  Total: {formatPrice(result.total)}
                </p>
                {result.status === "completed" &&
                  (result.shippingCarrier || result.trackingCode) && (
                    <div className="mt-3 rounded-xl bg-[#f7f1ea] px-3 py-2 text-sm text-[#5c4a3d]">
                      {result.shippingCarrier && (
                        <p>Envío: {result.shippingCarrier}</p>
                      )}
                      {result.trackingCode && (
                        <p>Seguimiento: {result.trackingCode}</p>
                      )}
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
