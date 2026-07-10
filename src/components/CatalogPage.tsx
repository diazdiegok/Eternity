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
      <section className="relative overflow-hidden bg-[#f5ebe3]">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -left-20 top-0 h-full w-40 bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,#d4b89633_8px,#d4b89633_9px)]" />
        </div>
        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-5 px-4 py-8 sm:gap-8 sm:px-6 sm:py-16 md:flex-row md:items-center md:gap-10 md:py-20 md:text-left">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-[#faf6f1] shadow-lg ring-2 ring-[#d4b896]/40 sm:h-44 sm:w-44 md:h-60 md:w-60">
            <Image
              src="/logo-hero.webp"
              alt="Eternity Recuerdos"
              fill
              className="object-contain p-2"
              sizes="(max-width: 640px) 112px, (max-width: 768px) 176px, 240px"
              priority
              unoptimized
            />
          </div>
          <div className="max-w-xl text-center md:text-left">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#9a7349] sm:text-xs sm:tracking-[0.35em]">
              Catálogo online
            </p>
            <h1 className="mt-2 font-serif text-3xl tracking-wide text-[#5c4a3d] sm:mt-3 sm:text-4xl md:text-5xl">
              {SITE.name}
            </h1>
            <p className="mt-2 text-base text-[#6b5d52] sm:mt-3 sm:text-lg">{SITE.tagline}</p>
            <p className="mt-1 text-xs text-[#8a7b6e] sm:text-sm">{SITE.subtitle}</p>

            <div className="mt-5 flex w-full flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3 md:justify-start">
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#3d7a54] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#326644] sm:w-auto sm:px-6"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Consultar por WhatsApp
            </a>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#d4b896] bg-white px-5 py-3 text-sm font-medium text-[#5c4a3d] transition hover:bg-[#faf6f1] sm:w-auto sm:px-6"
            >
              <InstagramIcon className="h-5 w-5 text-[#c13584]" />
              Ver Instagram
            </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        {categories.length > 1 && (
          <div className="-mx-4 mb-8 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mb-10 sm:flex sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
            <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap sm:justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm transition sm:px-5 sm:py-2.5 ${
                  category === cat
                    ? "bg-[#5c4a3d] text-white shadow-md"
                    : "bg-white text-[#6b5d52] ring-1 ring-[#e8ddd3] hover:ring-[#c9956a]"
                }`}
              >
                {cat}
              </button>
            ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl bg-[#f0e6dc]"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d4b896] bg-white p-12 text-center">
            <p className="font-serif text-2xl text-[#5c4a3d]">
              Pronto vas a ver productos acá
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
