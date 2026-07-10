"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
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

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-3 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Vista ampliada: ${name}`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl leading-none text-[#4a3b30] shadow-lg sm:right-5 sm:top-5"
      >
        ×
      </button>

      <div
        className="relative h-[min(92vh,920px)] w-full max-w-6xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="100vw"
          className="object-contain"
          unoptimized
          priority
        />
      </div>
    </div>,
    document.body
  );
}
