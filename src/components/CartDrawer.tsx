"use client";

import { useEffect, useState } from "react";
import { buildWhatsAppUrl, formatPrice } from "@/lib/whatsapp";
import { useCart } from "@/context/CartContext";
import { WhatsAppIcon } from "@/components/Icons";

export function CartDrawer() {
  const {
    items,
    total,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();
  const [note, setNote] = useState("");
  const [mpEnabled, setMpEnabled] = useState(false);
  const [loadingMp, setLoadingMp] = useState(false);

  useEffect(() => {
    fetch("/api/checkout/mercadopago")
      .then((r) => r.json())
      .then((data) => setMpEnabled(Boolean(data.enabled)))
      .catch(() => setMpEnabled(false));
  }, []);

  if (!isOpen) return null;

  async function handleMercadoPago() {
    setLoadingMp(true);
    try {
      const res = await fetch("/api/checkout/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      alert(data.error || "Error al iniciar el pago");
    } catch {
      alert("Error al conectar con Mercado Pago");
    } finally {
      setLoadingMp(false);
    }
  }

  function handleWhatsApp() {
    window.open(buildWhatsAppUrl(items, note), "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar carrito"
        className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm"
        onClick={closeCart}
      />

      <aside className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col bg-[#faf6f1] shadow-2xl sm:rounded-l-2xl">
        <div className="flex items-center justify-between border-b border-[#e8ddd3] px-5 py-4">
          <h2 className="font-serif text-2xl text-[#5c4a3d]">Tu carrito</h2>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full p-2 text-stone-500 hover:bg-stone-200"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="text-center text-stone-500">Todavía no agregaste productos.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-stone-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-stone-800">{item.name}</p>
                      <p className="text-sm text-stone-500">
                        {formatPrice(item.price)} c/u
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-300"
                      >
                        −
                      </button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-300"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-4 border-t border-stone-200 p-5">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nota opcional (fecha de entrega, dedicatoria...)"
              rows={2}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#8b6914]"
            />

            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <button
              type="button"
              onClick={handleWhatsApp}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 font-medium text-white transition hover:bg-[#1da851]"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Finalizar por WhatsApp
            </button>

            {mpEnabled && (
              <button
                type="button"
                onClick={handleMercadoPago}
                disabled={loadingMp}
                className="w-full rounded-full border-2 border-[#009ee3] py-3 font-medium text-[#009ee3] transition hover:bg-[#009ee3] hover:text-white disabled:opacity-60"
              >
                {loadingMp ? "Redirigiendo..." : "Pagar con Mercado Pago"}
              </button>
            )}

            <button
              type="button"
              onClick={clearCart}
              className="w-full text-sm text-stone-500 hover:text-stone-700"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
