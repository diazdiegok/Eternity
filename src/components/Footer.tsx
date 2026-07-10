import { SITE } from "@/lib/config";
import { InstagramIcon, WhatsAppIcon } from "@/components/Icons";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#e8ddd3] bg-[#f5ebe3]">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-8 text-center sm:flex-row sm:justify-between sm:gap-6 sm:px-6 sm:text-left">
        <div>
          <p className="font-serif text-lg tracking-wide text-[#5c4a3d]">{SITE.name}</p>
          <p className="text-sm text-[#6b5d52]">{SITE.subtitle}</p>
        </div>

        <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
          <a
            href={`https://wa.me/${SITE.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por WhatsApp"
            className="flex items-center justify-center gap-2 rounded-full bg-[#3d7a54] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#326644] sm:py-2.5"
          >
            <WhatsAppIcon className="h-5 w-5" />
            WhatsApp
          </a>
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Seguir en Instagram"
            className="flex items-center justify-center gap-2 rounded-full border border-[#d4b896] bg-white px-5 py-3 text-sm font-medium text-[#5c4a3d] transition hover:bg-[#faf6f1] sm:py-2.5"
          >
            <InstagramIcon className="h-5 w-5 text-[#c13584]" />
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
