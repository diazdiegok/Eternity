import { SITE } from "./config";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
};

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: SITE.currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

type WhatsAppOrderOptions = {
  items: CartItem[];
  note?: string;
  discount?: { code: string; percentOff: number; amount: number } | null;
  orderCode?: string | null;
  /** Pedido registrado (transferencia/comprobante) vs ya pagado con MP */
  paid?: boolean;
};

export function buildWhatsAppUrl(options: WhatsAppOrderOptions) {
  const { items, note, discount, orderCode, paid = false } = options;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = discount ? Math.max(0, subtotal - discount.amount) : subtotal;
  const brand = SITE.emailBrand;

  const lines: string[] = [];

  if (paid) {
    lines.push(
      `Hola! Acabo de *pagar* un pedido en *${brand}*.`,
      ""
    );
  } else {
    lines.push(
      `Hola! Realicé un *pedido* en *${brand}*.`,
      ""
    );
  }

  if (orderCode) {
    lines.push(`N° de pedido: *${orderCode}*`, "");
  }

  lines.push(
    ...items.map(
      (item) =>
        `• ${item.quantity}x ${item.name} — ${formatPrice(item.price * item.quantity)}`
    ),
    ""
  );

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

  if (paid) {
    lines.push(
      "",
      "✅ El pago ya fue realizado por Mercado Pago.",
      "Quedo a la espera de la confirmación y el envío."
    );
  } else {
    lines.push(
      "",
      "📎 *Importante:* voy a adjuntar / adjunto el *comprobante de pago*.",
      "Por favor confirmen cuando lo reciban. ¡Gracias!"
    );
  }

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${SITE.whatsapp}?text=${text}`;
}
