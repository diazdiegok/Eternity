export const PERSONAL_DELIVERY = "Entrega personal";

export const SHIPPING_CARRIERS = [
  "Via Cargo",
  "Andreani",
  "OCA",
  "Correo Argentino",
  "Otro",
] as const;

export type ShippingCarrier = (typeof SHIPPING_CARRIERS)[number] | string;

export function isPersonalDelivery(carrier: string | null | undefined) {
  return (carrier || "").trim().toLowerCase() === PERSONAL_DELIVERY.toLowerCase();
}
