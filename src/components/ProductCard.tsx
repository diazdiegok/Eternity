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
      <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#e8ddd3] bg-white shadow-sm transition duration-300 sm:hover:-translate-y-1 sm:hover:shadow-xl">
        <div className="relative aspect-[4/3] bg-[#f5ebe3] sm:aspect-square">
          {product.imageUrl ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="relative flex h-full w-full cursor-zoom-in items-center justify-center p-4 transition active:bg-[#f0e6dc] sm:p-6 sm:hover:bg-[#f0e6dc]"
              aria-label={`Ver ${product.name} en grande`}
            >
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                quality={100}
                className="object-contain object-center p-2 transition duration-500 sm:p-3 sm:group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized
              />
              <span className="pointer-events-none absolute bottom-3 right-3 hidden rounded-full bg-[#5c4a3d]/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100 sm:inline">
                Ampliar
              </span>
            </button>
          ) : (
            <div className="flex h-full items-center justify-center text-[#8a7b6e]">
              Sin imagen
            </div>
          )}
          {product.featured && (
            <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-[#5c4a3d] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#faf6f1] sm:px-3 sm:text-[10px]">
              Destacado
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#9a7349] sm:text-[11px] sm:tracking-[0.2em]">
            {product.category}
          </p>
          <h3 className="mt-1.5 font-serif text-lg leading-snug text-[#5c4a3d] sm:mt-2 sm:text-xl">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-[#6b5d52] sm:mt-2 sm:line-clamp-3">
              {product.description}
            </p>
          )}
          <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="inline-flex w-fit rounded-lg bg-[#5c4a3d] px-3 py-1.5 text-base font-semibold text-white">
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
              className="w-full rounded-full bg-[#5c4a3d] px-4 py-3 text-sm font-medium text-white transition active:scale-[0.98] sm:w-auto sm:bg-transparent sm:py-2 sm:text-[#5c4a3d] sm:ring-1 sm:ring-[#5c4a3d] sm:hover:bg-[#5c4a3d] sm:hover:text-white"
            >
              Agregar al carrito
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
