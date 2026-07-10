"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { SITE } from "@/lib/config";
import { InstagramIcon, WhatsAppIcon } from "@/components/Icons";

export function HeroBrand() {
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const [showRest, setShowRest] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduceMotion(prefersReduce);

    if (prefersReduce) {
      setTyped(SITE.name);
      setDone(true);
      setShowRest(true);
      return;
    }

    let i = 0;
    const full = SITE.name;
    let interval: number | undefined;
    const startDelay = window.setTimeout(() => {
      interval = window.setInterval(() => {
        i += 1;
        setTyped(full.slice(0, i));
        if (i >= full.length) {
          if (interval) window.clearInterval(interval);
          setDone(true);
          window.setTimeout(() => setShowRest(true), 180);
        }
      }, 95);
    }, 550);

    return () => {
      window.clearTimeout(startDelay);
      if (interval) window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative mx-auto grid max-w-5xl items-center gap-7 px-5 py-12 sm:gap-10 sm:px-6 sm:py-16 md:grid-cols-[auto_1fr] md:py-20">
      <div
        className={`mx-auto h-40 w-40 overflow-hidden rounded-full bg-[#f7f1ea] shadow-[0_22px_50px_-20px_rgba(74,59,48,0.5)] ring-1 ring-[#d4b896]/55 sm:h-52 sm:w-52 md:mx-0 md:h-60 md:w-60 ${
          reduceMotion ? "" : "animate-logo-drop"
        }`}
      >
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
        <h1
          className="font-serif text-[3rem] leading-[0.92] tracking-[0.03em] text-[#4a3b30] sm:text-6xl md:text-7xl"
          aria-label={SITE.name}
        >
          <span>{typed}</span>
          <span
            className={`ml-0.5 inline-block h-[0.85em] w-[3px] translate-y-[0.08em] bg-[#a67c52] align-baseline ${
              done ? "opacity-0" : "animate-caret"
            }`}
            aria-hidden="true"
          />
        </h1>

        <div
          className={`transition-all duration-700 ${
            showRest ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <p className="mt-4 text-base text-[#6d5c4d] sm:text-lg">{SITE.tagline}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#8a7b6e] md:mx-0">
            Piezas únicas hechas con amor para guardar un recuerdo eterno.
          </p>

          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:justify-center md:justify-start">
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
              className="btn-press inline-flex items-center justify-center gap-2 rounded-full border border-[#c9b29a] bg-white px-6 py-3.5 text-sm font-medium text-[#4a3b30] hover:bg-[#f7f1ea]"
            >
              <InstagramIcon className="h-4 w-4" />
              Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
