"use client";

import { useEffect } from "react";
import Image from "next/image";

type ProductImageLightboxProps = {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  name: string;
};

export function ProductImageLightbox({
  open,
  onClose,
  imageUrl,
  name,
}: ProductImageLightboxProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="animate-backdrop-in fixed inset-0 z-[100] bg-[#1a1512]/92 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Vista ampliada: ${name}`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl leading-none text-[#4a3b30] shadow-lg transition hover:scale-105 sm:right-5 sm:top-5"
      >
        ×
      </button>

      <div
        className="animate-lightbox-zoom absolute inset-3 sm:inset-8 md:inset-12"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-full w-full">
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="100vw"
            className="object-contain object-center"
            unoptimized
            priority
          />
        </div>
      </div>
    </div>
  );
}
