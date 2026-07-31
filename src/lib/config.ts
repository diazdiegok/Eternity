export const SITE = {
  name: "Eternity",
  brandFull: "Eternity Recuerdos",
  /** Nombre que aparece en correos al cliente */
  emailBrand: "Eternity Joyas Maternas",
  tagline: "Joyas de leche materna",
  subtitle: "Accesorios y box personalizados",
  whatsapp: "5493435001061",
  instagram: "https://www.instagram.com/eternity.recuerdos",
  currency: "ARS",
} as const;

/** URL pública de producción (fallback si falta env en Render) */
export const PRODUCTION_BASE_URL = "https://eternity-i5n2.onrender.com";

export function getBaseUrl() {
  const fromEnv = (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    ""
  ).trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_BASE_URL;
  }
  return "http://localhost:3000";
}

/** URL absoluta del logo para correos (PNG: mejor soporte en clientes de mail) */
export function getEmailLogoUrl() {
  return `${getBaseUrl()}/logo.png`;
}
