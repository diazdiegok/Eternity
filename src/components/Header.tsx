"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/config";
import { useCart } from "@/context/CartContext";
import { CartIcon } from "@/components/Icons";

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
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:px-6 sm:py-3.5">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#efe4d8] ring-1 ring-[#d4b896]/60 shadow-sm transition duration-300 group-hover:ring-[#a67c52] sm:h-10 sm:w-10">
            <Image
              src="/logo-icon.webp"
              alt=""
              fill
              className="object-cover"
              sizes="40px"
              unoptimized
              priority
            />
          </span>
          <span className="min-w-0">
            <span className="block font-serif text-[1.35rem] tracking-[0.12em] text-[#4a3b30] transition duration-300 group-hover:tracking-[0.16em] group-hover:text-[#a67c52] sm:text-2xl">
              {SITE.name}
            </span>
            <span className="hidden text-[10px] uppercase tracking-[0.18em] text-[#a67c52] sm:block">
              Joyas de leche materna
            </span>
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
    </header>
  );
}
