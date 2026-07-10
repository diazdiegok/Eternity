"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ProductCard } from "@/components/ProductCard";
import { SITE } from "@/lib/config";
import { InstagramIcon, WhatsAppIcon } from "@/components/Icons";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category: string;
  featured: boolean;
};

const CATEGORY_ORDER = ["Sin Bordes", "Bordes de Acero", "Plata 925"];

export function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("Todos");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const unique = [...new Set(products.map((p) => p.category))];
    unique.sort(
      (a, b) =>
        (CATEGORY_ORDER.indexOf(a) === -1 ? 99 : CATEGORY_ORDER.indexOf(a)) -
        (CATEGORY_ORDER.indexOf(b) === -1 ? 99 : CATEGORY_ORDER.indexOf(b))
    );
    return ["Todos", ...unique];
  }, [products]);

  const filtered = useMemo(() => {
    if (category === "Todos") return products;
    return products.filter((p) => p.category === category);
  }, [products, category]);

  return (
    <main>
      <section className="relative overflow-hidden border-b border-[#e4d5c5] bg-[linear-gradient(165deg,#f3e8dc_0%,#f7f1ea_45%,#efe4d8_100%)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 20% 20%, #d4b89644, transparent 55%), radial-gradient(ellipse 70% 50% at 90% 80%, #c9956a22, transparent 50%)",
          }}
        />

        <div className="relative mx-auto grid max-w-5xl items-center gap-6 px-5 py-10 sm:gap-10 sm:px-6 sm:py-16 md:grid-cols-[auto_1fr] md:py-20">
          <div className="animate-soft-in mx-auto h-36 w-36 overflow-hidden rounded-full bg-[#f7f1ea] shadow-[0_18px_40px_-18px_rgba(74,59,48,0.45)] ring-1 ring-[#d4b896]/50 sm:h-48 sm:w-48 md:mx-0 md:h-56 md:w-56">
            <div className="relative h-full w-full">
              <Image
                src="/logo-hero.webp"
                alt="Eternity Recuerdos"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 144px, (max-width: 768px) 192px, 224px"
                priority
                unoptimized
              />
            </div>
          </div>

          <div className="text-center md:text-left">
            <h1 className="animate-fade-up font-serif text-[2.75rem] leading-none tracking-[0.04em] text-[#4a3b30] sm:text-6xl md:text-7xl">
              {SITE.name}
            </h1>
            <p className="animate-fade-up animate-delay-1 mt-3 text-base text-[#6d5c4d] sm:text-lg">
              {SITE.tagline}
            </p>

            <div className="animate-fade-up animate-delay-2 mt-7 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:justify-center md:justify-start">
              <a
                href={`https://wa.me/${SITE.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#4a3b30] px-6 py-3.5 text-sm font-medium text-[#f7f1ea] transition hover:bg-[#6d5c4d] active:scale-[0.98]"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Consultar por WhatsApp
              </a>
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#c9b29a] bg-transparent px-6 py-3.5 text-sm font-medium text-[#4a3b30] transition hover:bg-white/60 active:scale-[0.98]"
              >
                <InstagramIcon className="h-4 w-4" />
                Instagram
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-0 pb-14 pt-0 sm:px-6 sm:pb-16 sm:pt-4">
        {categories.length > 1 && (
          <div className="sticky top-[57px] z-30 border-b border-[#e4d5c5]/80 bg-[#f7f1ea]/95 backdrop-blur-md sm:static sm:border-0 sm:bg-transparent sm:backdrop-blur-none">
            <div className="scrollbar-none -mx-0 overflow-x-auto px-5 py-3.5 sm:mx-0 sm:flex sm:justify-center sm:overflow-visible sm:px-0 sm:py-6">
              <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap sm:justify-center">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`shrink-0 rounded-full px-4 py-2 text-[13px] transition sm:px-5 sm:text-sm ${
                      category === cat
                        ? "bg-[#4a3b30] text-[#f7f1ea]"
                        : "bg-white/70 text-[#6d5c4d] ring-1 ring-[#e4d5c5] hover:text-[#4a3b30]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="px-4 sm:px-0">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] animate-pulse rounded-3xl bg-[#efe4d8]"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#d4b896] bg-white/50 p-12 text-center">
              <p className="font-serif text-2xl text-[#4a3b30]">
                Pronto vas a ver productos acá
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
              {filtered.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
