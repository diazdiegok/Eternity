/** Características / códigos de área frecuentes (Argentina) */
export const PHONE_AREA_CODES = [
  { code: "11", label: "11 — CABA / GBA" },
  { code: "221", label: "221 — La Plata" },
  { code: "223", label: "223 — Mar del Plata" },
  { code: "261", label: "261 — Mendoza" },
  { code: "341", label: "341 — Rosario" },
  { code: "342", label: "342 — Santa Fe" },
  { code: "343", label: "343 — Paraná" },
  { code: "351", label: "351 — Córdoba" },
  { code: "3541", label: "3541 — Villa Carlos Paz" },
  { code: "370", label: "370 — Formosa" },
  { code: "376", label: "376 — Posadas" },
  { code: "379", label: "379 — Corrientes" },
  { code: "380", label: "380 — La Rioja" },
  { code: "381", label: "381 — Tucumán" },
  { code: "383", label: "383 — Catamarca" },
  { code: "385", label: "385 — Santiago del Estero" },
  { code: "387", label: "387 — Salta" },
  { code: "388", label: "388 — Jujuy" },
  { code: "299", label: "299 — Neuquén" },
  { code: "291", label: "291 — Bahía Blanca" },
  { code: "280", label: "280 — Trelew" },
] as const;

export const DEFAULT_AREA_CODE = "343";

/** Solo dígitos del número local (sin 0 ni 15) */
export function normalizeLocalPhone(value: string) {
  return String(value || "")
    .replace(/\D/g, "")
    .replace(/^0/, "")
    .replace(/^15/, "");
}

export function buildWhatsAppPhone(areaCode: string, localNumber: string) {
  const area = String(areaCode || "").replace(/\D/g, "");
  const local = normalizeLocalPhone(localNumber);
  if (!area || area.length < 2 || !local) return null;
  return `549${area}${local}`;
}

export function formatDisplayPhone(areaCode: string, localNumber: string) {
  const area = String(areaCode || "").replace(/\D/g, "");
  const local = normalizeLocalPhone(localNumber);
  if (!area || !local) return "";
  return `(${area}) ${local}`;
}

export function isValidLocalPhone(localNumber: string) {
  const local = normalizeLocalPhone(localNumber);
  return local.length >= 6 && local.length <= 10;
}

export function isValidAreaCode(areaCode: string) {
  const area = String(areaCode || "").replace(/\D/g, "");
  return area.length >= 2 && area.length <= 4;
}
