"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
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
      <section className="relative overflow-hidden border-b border-[#e4d5c5] bg-[linear-gradient(165deg,#f3e8dc_0%,#f7f1ea_48%,#efe4d8_100%)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 18% 18%, #d4b89655, transparent 55%), radial-gradient(ellipse 70% 50% at 92% 78%, #c9956a28, transparent 50%)",
          }}
        />
        <div className="pointer-events-none absolute -right-16 top-10 h-56 w-56 rounded-full bg-[#d4b896]/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-[#a67c52]/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-5xl items-center gap-7 px-5 py-12 sm:gap-10 sm:px-6 sm:py-16 md:grid-cols-[auto_1fr] md:py-20">
          <div className="animate-soft-in animate-float mx-auto h-40 w-40 overflow-hidden rounded-full bg-[#f7f1ea] shadow-[0_22px_50px_-20px_rgba(74,59,48,0.5)] ring-1 ring-[#d4b896]/55 sm:h-52 sm:w-52 md:mx-0 md:h-60 md:w-60">
            <div className="relative h-full w-full">
              <Image
                src="/logo-hero.webp"
                alt="Eternity Recuerdos"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 160px, (max-width: 768px) 208px, 240px"
                priority
                unoptimized
              />
            </div>
          </div>

          <div className="text-center md:text-left">
            <h1 className="animate-fade-up font-serif text-[3rem] leading-[0.92] tracking-[0.03em] text-[#4a3b30] sm:text-6xl md:text-7xl">
              {SITE.name}
            </h1>
            <p className="animate-fade-up animate-delay-1 mt-4 text-base text-[#6d5c4d] sm:text-lg">
              {SITE.tagline}
            </p>
            <p className="animate-fade-up animate-delay-2 mx-auto mt-2 max-w-md text-sm text-[#8a7b6e] md:mx-0">
              Piezas únicas hechas con amor para guardar un recuerdo eterno.
            </p>

            <div className="animate-fade-up animate-delay-3 mt-8 flex flex-col gap-2.5 sm:flex-row sm:justify-center md:justify-start">
              <a
                href={`https://wa.me/${SITE.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press inline-flex items-center justify-center gap-2 rounded-full bg-[#4a3b30] px-6 py-3.5 text-sm font-medium text-[#f7f1ea] shadow-[0_10px_24px_-12px_rgba(74,59,48,0.7)] hover:bg-[#5c4a3d]"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Consultar por WhatsApp
              </a>
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press inline-flex items-center justify-center gap-2 rounded-full border border-[#c9b29a] bg-white/40 px-6 py-3.5 text-sm font-medium text-[#4a3b30] backdrop-blur-sm hover:bg-white/80"
              >
                <InstagramIcon className="h-4 w-4" />
                Instagram
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-0 pb-16 pt-0 sm:px-6 sm:pb-20 sm:pt-2">
        <Reveal className="px-5 pb-1 pt-8 text-center sm:px-0 sm:pt-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#a67c52]">
            Colección
          </p>
          <h2 className="mt-2 font-serif text-3xl text-[#4a3b30] sm:text-4xl">
            Nuestras piezas
          </h2>
        </Reveal>

        {categories.length > 1 && (
          <div className="sticky top-[57px] z-30 border-b border-[#e4d5c5]/80 bg-[#f7f1ea]/95 backdrop-blur-md sm:static sm:border-0 sm:bg-transparent sm:backdrop-blur-none">
            <div className="scrollbar-none overflow-x-auto px-5 py-3.5 sm:flex sm:justify-center sm:overflow-visible sm:px-0 sm:py-6">
              <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap sm:justify-center">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`shrink-0 rounded-full px-4 py-2 text-[13px] transition duration-300 sm:px-5 sm:text-sm ${
                      category === cat
                        ? "bg-[#4a3b30] text-[#f7f1ea] shadow-[0_8px_18px_-10px_rgba(74,59,48,0.8)]"
                        : "bg-white/70 text-[#6d5c4d] ring-1 ring-[#e4d5c5] hover:text-[#4a3b30] hover:ring-[#c9b29a]"
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
                  className="skeleton-shimmer aspect-[4/5] rounded-[1.35rem]"
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
            <div
              key={category}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7"
            >
              {filtered.map((product, index) => (
                <Reveal key={product.id} delay={Math.min(index, 6) * 60}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
