"use client";

import { useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/whatsapp";
import { useCart } from "@/context/CartContext";
import { ProductImageLightbox } from "@/components/ProductImageLightbox";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category: string;
  featured: boolean;
};

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#e8ddd3] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative aspect-square bg-[#f5ebe3]">
          {product.imageUrl ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="relative flex h-full w-full cursor-zoom-in items-center justify-center p-6 transition hover:bg-[#f0e6dc]"
              aria-label={`Ver ${product.name} en grande`}
            >
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                quality={100}
                className="object-contain object-center p-3 transition duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized
              />
              <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-[#5c4a3d]/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100">
                Ampliar
              </span>
            </button>
          ) : (
            <div className="flex h-full items-center justify-center text-[#b5a89c]">
              Sin imagen
            </div>
          )}
          {product.featured && (
            <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-[#5c4a3d] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#faf6f1]">
              Destacado
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#9a7349]">
            {product.category}
          </p>
          <h3 className="mt-2 font-serif text-xl leading-snug text-[#5c4a3d]">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[#8a7b6e]">
              {product.description}
            </p>
          )}
          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="rounded-lg bg-[#5c4a3d] px-3 py-1.5 text-base font-semibold text-white">
              {formatPrice(product.price)}
            </p>
            <button
              type="button"
              onClick={() =>
                addItem({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                })
              }
              className="rounded-full border border-[#5c4a3d] px-4 py-2 text-sm font-medium text-[#5c4a3d] transition hover:bg-[#5c4a3d] hover:text-white"
            >
              Agregar
            </button>
          </div>
        </div>
      </article>

      {product.imageUrl && (
        <ProductImageLightbox
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          imageUrl={product.imageUrl}
          name={product.name}
        />
      )}
    </>
  );
}
