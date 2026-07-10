"use client";

import Link from "next/link";
import { SITE } from "@/lib/config";
import { useCart } from "@/context/CartContext";
import { CartIcon } from "@/components/Icons";

export function Header() {
  const { count, openCart } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-[#e4d5c5]/70 bg-[#f7f1ea]/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:px-6 sm:py-3.5">
        <Link href="/" className="group min-w-0">
          <p className="font-serif text-[1.35rem] tracking-[0.12em] text-[#4a3b30] transition group-hover:text-[#a67c52] sm:text-2xl">
            {SITE.name}
          </p>
        </Link>

        <button
          type="button"
          onClick={openCart}
          aria-label="Abrir carrito"
          className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#4a3b30] text-[#f7f1ea] transition hover:bg-[#6d5c4d]"
        >
          <CartIcon className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#a67c52] px-1 text-[11px] font-bold text-white">
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
