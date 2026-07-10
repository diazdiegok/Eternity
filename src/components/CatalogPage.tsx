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
        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 px-4 py-16 sm:px-6 sm:py-20 md:flex-row md:items-center md:gap-10 md:text-left">
          <div className="relative h-44 w-44 shrink-0 overflow-hidden rounded-full bg-[#faf6f1] shadow-lg ring-2 ring-[#d4b896]/40 sm:h-52 sm:w-52 md:h-60 md:w-60">
            <Image
              src="/logo-hero.webp"
              alt="Eternity Recuerdos"
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 208px, 240px"
              priority
              unoptimized
            />
          </div>
          <div className="max-w-xl text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.35em] text-[#9a7349]">
              Catálogo online
            </p>
            <h1 className="mt-3 font-serif text-4xl tracking-wide text-[#5c4a3d] sm:text-5xl">
              {SITE.name}
            </h1>
            <p className="mt-3 text-lg text-[#8a7b6e]">{SITE.tagline}</p>
            <p className="mt-1 text-sm text-[#a89888]">{SITE.subtitle}</p>

            <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#1da851]"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Consultar por WhatsApp
            </a>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#d4b896] bg-white px-6 py-3 text-sm font-medium text-[#5c4a3d] transition hover:bg-[#faf6f1]"
            >
              <InstagramIcon className="h-5 w-5 text-[#c13584]" />
              Ver Instagram
            </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {categories.length > 1 && (
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full px-5 py-2.5 text-sm transition ${
                  category === cat
                    ? "bg-[#5c4a3d] text-white shadow-md"
                    : "bg-white text-[#8a7b6e] ring-1 ring-[#e8ddd3] hover:ring-[#c9956a]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
