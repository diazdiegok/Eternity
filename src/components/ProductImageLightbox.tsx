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

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Vista ampliada: ${name}`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl text-[#5c4a3d] shadow-lg transition hover:bg-white"
      >
        ×
      </button>

      <div
        className="relative flex h-[min(90vh,900px)] w-full max-w-5xl items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={imageUrl}
          alt={name}
          width={1440}
          height={1440}
          className="max-h-full max-w-full object-contain object-center"
          unoptimized
          priority
        />
      </div>
    </div>
  );
}
