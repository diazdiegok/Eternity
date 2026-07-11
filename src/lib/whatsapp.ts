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

export function buildWhatsAppUrl(
  items: CartItem[],
  note?: string,
  discount?: { code: string; percentOff: number; amount: number } | null
) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = discount ? Math.max(0, subtotal - discount.amount) : subtotal;

  const lines = [
    `Hola! Quiero consultar/comprar en *${SITE.brandFull}*:`,
    "",
    ...items.map(
      (item) =>
        `• ${item.quantity}x ${item.name} — ${formatPrice(item.price * item.quantity)}`
    ),
    "",
  ];

  if (discount && discount.percentOff > 0) {
    lines.push(
      `Subtotal: ${formatPrice(subtotal)}`,
      `Cupón *${discount.code}* (−${discount.percentOff}%): −${formatPrice(discount.amount)}`,
      `*Total: ${formatPrice(total)}*`
    );
  } else {
    lines.push(`*Total: ${formatPrice(total)}*`);
  }

  if (note?.trim()) {
    lines.push("", `Nota: ${note.trim()}`);
  }

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${SITE.whatsapp}?text=${text}`;
}
