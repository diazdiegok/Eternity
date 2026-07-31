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
