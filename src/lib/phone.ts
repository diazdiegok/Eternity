/** Características / códigos de área frecuentes (Argentina) */
export const PHONE_AREA_CODES = [
  { code: "11", label: "11 — CABA / GBA" },
  { code: "220", label: "220 — Merlo" },
  { code: "221", label: "221 — La Plata" },
  { code: "223", label: "223 — Mar del Plata" },
  { code: "230", label: "230 — Pilar" },
  { code: "236", label: "236 — Junín" },
  { code: "249", label: "249 — Tandil" },
  { code: "260", label: "260 — San Rafael" },
  { code: "261", label: "261 — Mendoza" },
  { code: "264", label: "264 — San Juan" },
  { code: "266", label: "266 — San Luis" },
  { code: "280", label: "280 — Trelew" },
  { code: "291", label: "291 — Bahía Blanca" },
  { code: "294", label: "294 — Bariloche" },
  { code: "297", label: "297 — Comodoro Rivadavia" },
  { code: "298", label: "298 — Neuquén / Cipolletti" },
  { code: "299", label: "299 — Neuquén" },
  { code: "341", label: "341 — Rosario" },
  { code: "342", label: "342 — Santa Fe" },
  { code: "343", label: "343 — Paraná" },
  { code: "345", label: "345 — Concordia" },
  { code: "348", label: "348 — San Nicolás" },
  { code: "351", label: "351 — Córdoba" },
  { code: "353", label: "353 — Villa María" },
  { code: "3541", label: "3541 — Villa Carlos Paz" },
  { code: "358", label: "358 — Río Cuarto" },
  { code: "362", label: "362 — Resistencia" },
  { code: "364", label: "364 — Sáenz Peña" },
  { code: "370", label: "370 — Formosa" },
  { code: "376", label: "376 — Posadas" },
  { code: "379", label: "379 — Corrientes" },
  { code: "380", label: "380 — La Rioja" },
  { code: "381", label: "381 — Tucumán" },
  { code: "383", label: "383 — Catamarca" },
  { code: "385", label: "385 — Santiago del Estero" },
  { code: "387", label: "387 — Salta" },
  { code: "388", label: "388 — Jujuy" },
  { code: "389", label: "389 — Orán" },
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
