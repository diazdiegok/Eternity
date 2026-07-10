import { SITE } from "@/lib/config";
import { InstagramIcon, WhatsAppIcon } from "@/components/Icons";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#e8ddd3] bg-[#f5ebe3]">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-8 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
        <div>
          <p className="font-serif text-lg tracking-wide text-[#5c4a3d]">{SITE.name}</p>
          <p className="text-sm text-[#8a7b6e]">{SITE.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/${SITE.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por WhatsApp"
            className="flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1da851]"
          >
            <WhatsAppIcon className="h-5 w-5" />
            WhatsApp
          </a>
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Seguir en Instagram"
            className="flex items-center gap-2 rounded-full bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            <InstagramIcon className="h-5 w-5" />
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
