"use client";

import { useEffect, useState } from "react";
import { buildWhatsAppUrl, formatPrice } from "@/lib/whatsapp";
import { useCart } from "@/context/CartContext";
import { WhatsAppIcon } from "@/components/Icons";
import { NoticeDialog } from "@/components/ConfirmDialog";

export function CartDrawer() {
  const {
    items,
    subtotal,
    discountAmount,
    total,
    coupon,
    applyCoupon,
    clearCoupon,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();
  const [note, setNote] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [mpEnabled, setMpEnabled] = useState(false);
  const [loadingMp, setLoadingMp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedCode, setCompletedCode] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/checkout/mercadopago")
      .then((r) => r.json())
      .then((data) => setMpEnabled(Boolean(data.enabled)))
      .catch(() => setMpEnabled(false));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  function handleClose() {
    setCompletedCode(null);
    closeCart();
  }

  async function handleApplyCoupon() {
    setApplyingCoupon(true);
    setCouponMsg("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponMsg(data.error || "Cupón inválido");
        return;
      }
      applyCoupon({ code: data.code, percentOff: data.percentOff });
      setCouponInput("");
      setCouponMsg(`Cupón ${data.code} aplicado (−${data.percentOff}%)`);
    } catch {
      setCouponMsg("No se pudo validar el cupón");
    } finally {
      setApplyingCoupon(false);
    }
  }

  const orderPayload = {
    items,
    note,
    couponCode: coupon?.code || null,
    discountPercent: coupon?.percentOff || 0,
  };

  async function handleMercadoPago() {
    setLoadingMp(true);
    try {
      const res = await fetch("/api/checkout/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        clearCart();
        window.location.href = data.checkoutUrl;
        return;
      }
      setNotice(data.error || "Error al iniciar el pago");
    } catch {
      setNotice("Error al conectar con Mercado Pago");
    } finally {
      setLoadingMp(false);
    }
  }

  async function handleWhatsApp() {
    if (submitting || items.length === 0) return;
    setSubmitting(true);

    const cartSnapshot = [...items];
    const noteSnapshot = note;
    const couponSnapshot = coupon
      ? {
          code: coupon.code,
          percentOff: coupon.percentOff,
          amount: discountAmount,
        }
      : null;

    let orderCode: string | null = null;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...orderPayload, channel: "whatsapp" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.code) {
        orderCode = String(data.code);
      }
    } catch {
      // Si falla el registro, igual abrimos WhatsApp
    }

    window.open(
      buildWhatsAppUrl(cartSnapshot, noteSnapshot, couponSnapshot, orderCode),
      "_blank",
      "noopener,noreferrer"
    );

    clearCart();
    clearCoupon();
    setNote("");
    setCouponInput("");
    setCouponMsg("");
    setCompletedCode(orderCode || "registrado");
    setSubmitting(false);
  }

  const showSuccess = Boolean(completedCode) && items.length === 0;

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar carrito"
        className="animate-backdrop-in fixed inset-0 z-50 bg-[#4a3b30]/35 backdrop-blur-[2px]"
        onClick={handleClose}
      />

      <aside className="animate-drawer-in fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col bg-[#f7f1ea] shadow-2xl sm:rounded-l-3xl">
        <div className="flex items-center justify-between border-b border-[#e4d5c5] px-5 py-4">
          <div>
            <h2 className="font-serif text-2xl text-[#4a3b30]">
              {showSuccess ? "Pedido realizado" : "Tu carrito"}
            </h2>
            <p className="text-xs text-[#8a7b6e]">
              {showSuccess
                ? "Te redirigimos a WhatsApp"
                : items.length === 0
                  ? "Vacío"
                  : `${items.reduce((n, i) => n + i.quantity, 0)} ítem(s)`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#6d5c4d] transition hover:bg-[#efe4d8]"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {showSuccess ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f5e9] text-2xl text-green-700">
                ✓
              </div>
              <div>
                <p className="font-serif text-2xl text-[#4a3b30]">
                  ¡Pedido realizado!
                </p>
                {completedCode && completedCode !== "registrado" ? (
                  <p className="mt-3 text-sm text-[#6d5c4d]">
                    Tu número de pedido es
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-[#6d5c4d]">
                    Abrimos WhatsApp para que completes la consulta.
                  </p>
                )}
                {completedCode && completedCode !== "registrado" && (
                  <p className="mt-2 font-serif text-3xl tracking-wide text-[#4a3b30]">
                    {completedCode}
                  </p>
                )}
                <p className="mt-4 text-sm text-[#8a7b6e]">
                  Enviá el mensaje en WhatsApp para confirmarlo con nosotros.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 rounded-full bg-[#4a3b30] px-6 py-3 text-sm font-medium text-white"
              >
                Seguir mirando
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <p className="font-serif text-xl text-[#4a3b30]">Todavía vacío</p>
              <p className="text-sm text-[#8a7b6e]">
                Agregá una pieza para empezar tu pedido.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-2xl border border-[#e4d5c5] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#4a3b30]">{item.name}</p>
                      {item.originalPrice && item.originalPrice > item.price ? (
                        <p className="text-sm text-[#8a7b6e]">
                          <span className="mr-1.5 line-through decoration-[#c45c26]/70">
                            {formatPrice(item.originalPrice)}
                          </span>
                          <span className="text-[#c45c26]">
                            {formatPrice(item.price)} c/u · 🔥 HOT
                          </span>
                        </p>
                      ) : (
                        <p className="text-sm text-[#8a7b6e]">
                          {formatPrice(item.price)} c/u
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-sm text-[#a67c52] transition hover:text-[#4a3b30]"
                    >
                      Quitar
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e4d5c5] text-[#4a3b30] transition hover:bg-[#f7f1ea]"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-[#4a3b30]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e4d5c5] text-[#4a3b30] transition hover:bg-[#f7f1ea]"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-serif text-lg text-[#4a3b30]">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!showSuccess && items.length > 0 && (
          <div className="space-y-4 border-t border-[#e4d5c5] bg-white/50 p-5 backdrop-blur-sm">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nota opcional (fecha, dedicatoria...)"
              rows={2}
              className="w-full rounded-2xl border border-[#e4d5c5] bg-white px-3 py-2.5 text-sm text-[#4a3b30] outline-none transition focus:border-[#a67c52] focus:ring-2 focus:ring-[#a67c52]/20"
            />

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-[0.14em] text-[#8a7b6e]">
                Cupón de descuento
              </label>
              {coupon ? (
                <div className="flex items-center justify-between rounded-2xl border border-[#d4b896] bg-[#f5ebe3] px-3 py-2.5 text-sm">
                  <span className="text-[#4a3b30]">
                    <strong>{coupon.code}</strong> (−{coupon.percentOff}%)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      clearCoupon();
                      setCouponMsg("");
                    }}
                    className="text-[#a67c52] hover:text-[#4a3b30]"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Código"
                    className="min-w-0 flex-1 rounded-2xl border border-[#e4d5c5] bg-white px-3 py-2.5 text-sm text-[#4a3b30] outline-none focus:border-[#a67c52]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon || !couponInput.trim()}
                    className="rounded-full bg-[#4a3b30] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {applyingCoupon ? "..." : "Aplicar"}
                  </button>
                </div>
              )}
              {couponMsg && (
                <p className="text-xs text-[#6d5c4d]">{couponMsg}</p>
              )}
            </div>

            <div className="space-y-1">
              {discountAmount > 0 && (
                <>
                  <div className="flex items-center justify-between text-sm text-[#8a7b6e]">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[#a67c52]">
                    <span>Descuento</span>
                    <span>−{formatPrice(discountAmount)}</span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm uppercase tracking-[0.16em] text-[#8a7b6e]">
                  Total
                </span>
                <span className="font-serif text-2xl text-[#4a3b30]">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleWhatsApp}
              disabled={submitting}
              className="btn-press flex w-full items-center justify-center gap-2 rounded-full bg-[#4a3b30] py-3.5 font-medium text-[#f7f1ea] shadow-[0_12px_28px_-14px_rgba(74,59,48,0.8)] hover:bg-[#5c4a3d] disabled:opacity-60"
            >
              <WhatsAppIcon className="h-5 w-5" />
              {submitting ? "Registrando..." : "Finalizar por WhatsApp"}
            </button>

            {mpEnabled && (
              <button
                type="button"
                onClick={handleMercadoPago}
                disabled={loadingMp}
                className="btn-press w-full rounded-full border border-[#009ee3] py-3 font-medium text-[#009ee3] transition hover:bg-[#009ee3] hover:text-white disabled:opacity-60"
              >
                {loadingMp ? "Redirigiendo..." : "Pagar con Mercado Pago"}
              </button>
            )}

            <button
              type="button"
              onClick={clearCart}
              className="w-full text-sm text-[#8a7b6e] transition hover:text-[#4a3b30]"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>

      <NoticeDialog
        open={Boolean(notice)}
        title="No se pudo continuar"
        message={notice || ""}
        onClose={() => setNotice(null)}
      />
    </>
  );
}
