"use client";

import Link from "next/link";
import { SITE } from "@/lib/config";
import { useCart } from "@/context/CartContext";
import { CartIcon } from "@/components/Icons";

export function Header() {
  const { count, openCart } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-[#e8ddd3]/80 bg-[#faf6f1]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-3.5">
        <Link href="/" className="group min-w-0 flex-1">
          <p className="truncate font-serif text-xl tracking-[0.08em] text-[#5c4a3d] transition group-hover:text-[#9a7349] sm:text-2xl sm:tracking-[0.1em]">
            {SITE.name}
          </p>
          <p className="truncate text-[10px] uppercase tracking-[0.15em] text-[#8a7b6e] sm:text-[11px] sm:tracking-[0.2em]">
            {SITE.tagline}
          </p>
        </Link>

        <button
          type="button"
          onClick={openCart}
          aria-label="Abrir carrito"
          className="relative inline-flex shrink-0 items-center gap-2 rounded-full bg-[#5c4a3d] px-3.5 py-2.5 text-sm font-medium text-[#faf6f1] transition hover:bg-[#9a7349] sm:px-4"
        >
          <CartIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Carrito</span>
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c9956a] px-1 text-xs font-bold text-white">
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
