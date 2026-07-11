export const SHIPPING_CARRIERS = [
  "Via Cargo",
  "Andreani",
  "OCA",
  "Correo Argentino",
  "Otro",
] as const;

export type ShippingCarrier = (typeof SHIPPING_CARRIERS)[number] | string;
