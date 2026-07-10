export const SITE = {
  name: "Eternity",
  brandFull: "Eternity Recuerdos",
  tagline: "Joyas de leche materna",
  subtitle: "Accesorios y box personalizados",
  whatsapp: "5493435001061",
  instagram: "https://www.instagram.com/eternity.recuerdos",
  currency: "ARS",
} as const;

export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
