"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SITE } from "@/lib/config";
import { useCart } from "@/context/CartContext";
import { CartIcon, TruckIcon } from "@/components/Icons";

export function Header() {
  const { count, openCart } = useCart();
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (count <= 0) return;
    setPop(true);
    const t = window.setTimeout(() => setPop(false), 450);
    return () => window.clearTimeout(t);
  }, [count]);

  return (
    <header className="sticky top-0 z-40 border-b border-[#e4d5c5]/70 bg-[#f7f1ea]/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-3.5">
        <Link href="/" className="group min-w-0">
          <p className="font-serif text-[1.35rem] tracking-[0.12em] text-[#4a3b30] transition duration-300 group-hover:tracking-[0.16em] group-hover:text-[#a67c52] sm:text-2xl">
            {SITE.name}
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#a67c52]">
            Joyas de leche materna
          </p>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <Link
            href="/mi-pedido"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e4d5c5] bg-white/80 px-2.5 py-2 text-[#5c4a3d] transition hover:border-[#c9b29a] hover:text-[#4a3b30] sm:gap-2 sm:px-4"
            aria-label="Consultar mi pedido"
          >
            <TruckIcon className="h-4 w-4 shrink-0" />
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] sm:inline sm:text-xs">
              Consultar mi pedido
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] sm:hidden">
              Pedido
            </span>
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label="Abrir carrito"
            className={`btn-press relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#4a3b30] text-[#f7f1ea] hover:bg-[#5c4a3d] ${
              pop ? "animate-cart-pop" : ""
            }`}
          >
            <CartIcon className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#a67c52] px-1 text-[11px] font-bold text-white shadow-sm">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
