import { SITE } from "./config";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: SITE.currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function buildWhatsAppUrl(items: CartItem[], note?: string) {
  const lines = [
    `Hola! Quiero consultar/comprar en *${SITE.brandFull}*:`,
    "",
    ...items.map(
      (item) =>
        `• ${item.quantity}x ${item.name} — ${formatPrice(item.price * item.quantity)}`
    ),
    "",
    `*Total: ${formatPrice(items.reduce((sum, i) => sum + i.price * i.quantity, 0))}*`,
  ];

  if (note?.trim()) {
    lines.push("", `Nota: ${note.trim()}`);
  }

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${SITE.whatsapp}?text=${text}`;
}
