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

export function OrderLookupForm() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);

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
    <div className="space-y-6">
      <form
        onSubmit={handleLookup}
        className="rounded-3xl border border-[#e4d5c5] bg-white/90 p-6 shadow-sm sm:p-8"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-[#5c4a3d]">
            N° de orden
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ET-1234"
              className="mt-1.5 w-full rounded-xl border border-[#e8ddd3] bg-[#faf6f1] px-3 py-3 text-[#5c4a3d] outline-none transition focus:border-[#c9956a] focus:ring-2 focus:ring-[#c9956a]/20"
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
              className="mt-1.5 w-full rounded-xl border border-[#e8ddd3] bg-[#faf6f1] px-3 py-3 text-[#5c4a3d] outline-none transition focus:border-[#c9956a] focus:ring-2 focus:ring-[#c9956a]/20"
              required
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-full bg-[#4a3b30] py-3.5 text-sm font-medium text-white transition hover:bg-[#5c4a3d] disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {loading ? "Buscando..." : "Ver estado"}
        </button>
      </form>

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {result && (
        <article className="rounded-3xl border border-[#e4d5c5] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#a67c52]">
                Pedido
              </p>
              <h2 className="mt-1 font-serif text-3xl text-[#4a3b30]">
                {result.code}
              </h2>
            </div>
            <span className="rounded-full bg-[#f5ebe3] px-4 py-2 text-sm font-medium text-[#4a3b30]">
              {result.statusLabel}
            </span>
          </div>

          <p className="mt-3 text-sm text-[#8a7b6e]">
            {new Date(result.createdAt).toLocaleString("es-AR")}
          </p>

          <ul className="mt-6 space-y-2 border-t border-[#efe4d8] pt-5 text-sm text-[#6d5c4d]">
            {result.items.map((item, i) => (
              <li
                key={`${item.name}-${i}`}
                className="flex items-center justify-between gap-3"
              >
                <span>
                  {item.quantity}× {item.name}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <p className="mt-5 font-serif text-2xl text-[#4a3b30]">
            Total: {formatPrice(result.total)}
          </p>

          {result.status === "completed" &&
            (result.shippingCarrier || result.trackingCode) && (
              <div className="mt-5 rounded-2xl bg-[#f7f1ea] px-4 py-3 text-sm text-[#5c4a3d]">
                <p className="font-medium text-[#4a3b30]">Datos de envío</p>
                {result.shippingCarrier && (
                  <p className="mt-1">Empresa: {result.shippingCarrier}</p>
                )}
                {result.trackingCode && (
                  <p className="mt-1">Seguimiento: {result.trackingCode}</p>
                )}
              </div>
            )}
        </article>
      )}
    </div>
  );
}
