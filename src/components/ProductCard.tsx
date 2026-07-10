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
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 900);
  }

  return (
    <>
      <article className="product-card group overflow-hidden rounded-[1.35rem] bg-white shadow-[0_10px_30px_-18px_rgba(74,59,48,0.35)] ring-1 ring-[#e4d5c5]/80">
        <div className="relative aspect-[5/4] overflow-hidden bg-[#efe4d8] sm:aspect-square">
          {product.imageUrl ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="relative h-full w-full cursor-zoom-in"
              aria-label={`Ver ${product.name} en grande`}
            >
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                quality={100}
                className="object-cover object-center"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#4a3b30]/35 to-transparent p-4 opacity-0 transition duration-300 group-hover:opacity-100">
                <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[#4a3b30]">
                  Ampliar
                </span>
              </span>
            </button>
          ) : (
            <div className="flex h-full items-center justify-center text-[#8a7b6e]">
              Sin imagen
            </div>
          )}

          {product.featured && (
            <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-[#4a3b30]/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[#f7f1ea] backdrop-blur-sm">
              Destacado
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 px-4 py-4 sm:px-5 sm:py-5">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#a67c52]">
              {product.category}
            </p>
            <h3 className="mt-1.5 font-serif text-[1.35rem] leading-tight text-[#4a3b30] sm:text-xl">
              {product.name}
            </h3>
            {product.description && (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#6d5c4d]">
                {product.description}
              </p>
            )}
          </div>

          <div className="mt-1 flex items-center justify-between gap-3 border-t border-[#efe4d8] pt-3.5">
            <p className="font-serif text-xl font-medium tracking-wide text-[#4a3b30]">
              {formatPrice(product.price)}
            </p>
            <button
              type="button"
              onClick={handleAdd}
              className={`btn-press rounded-full px-4 py-2.5 text-sm font-medium text-[#f7f1ea] ${
                added ? "animate-added bg-[#a67c52]" : "bg-[#4a3b30] hover:bg-[#5c4a3d]"
              }`}
            >
              {added ? "Agregado ✓" : "Agregar"}
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
