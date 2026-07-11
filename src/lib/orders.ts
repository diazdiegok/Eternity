import { db } from "@/lib/db";
import type { CartItem } from "@/lib/whatsapp";

export type OrderChannel = "whatsapp" | "mercadopago" | "manual";
export type OrderStatus = "pending" | "completed" | "cancelled";

export const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "completed", label: "Completado" },
  { value: "cancelled", label: "Cancelado" },
];

/** Estados que cuentan como venta en el dashboard */
export const COUNTED_STATUSES = ["completed", "confirmed", "paid"] as const;

function makeCode() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `ET-${n}`;
}

export function normalizeOrderStatus(status: string): OrderStatus {
  if (status === "cancelled") return "cancelled";
  if (status === "pending") return "pending";
  // confirmed / paid / completed → completed
  if (["completed", "confirmed", "paid"].includes(status)) return "completed";
  return "pending";
}

export async function createOrder(input: {
  channel: OrderChannel;
  items: CartItem[];
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerNote?: string;
  status?: OrderStatus;
  mpPreferenceId?: string;
  couponCode?: string | null;
  discountPercent?: number | null;
}) {
  if (!input.items.length) {
    throw new Error("Sin ítems");
  }

  const subtotal = input.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const discountPercent = Math.min(
    100,
    Math.max(0, Number(input.discountPercent) || 0)
  );
  const discountAmount =
    discountPercent > 0 ? Math.round((subtotal * discountPercent) / 100) : 0;
  const total = Math.max(0, subtotal - discountAmount);

  let code = makeCode();
  for (let i = 0; i < 5; i++) {
    const exists = await db.order.findUnique({ where: { code } });
    if (!exists) break;
    code = makeCode();
  }

  return db.order.create({
    data: {
      code,
      channel: input.channel,
      status: input.status || "pending",
      customerName: input.customerName || null,
      customerPhone: input.customerPhone || null,
      customerEmail: input.customerEmail || null,
      customerNote: input.customerNote || "",
      total,
      couponCode: input.couponCode || null,
      discountPercent: discountPercent || null,
      discountAmount,
      mpPreferenceId: input.mpPreferenceId || null,
      items: {
        create: input.items.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    },
    include: { items: true },
  });
}

export function startOfDay(d = new Date()) {
  return startOfDayInTimeZone(d, "America/Argentina/Buenos_Aires");
}

/** Medianoche en zona horaria de Argentina (UTC-3). */
export function startOfDayInTimeZone(
  d = new Date(),
  timeZone = "America/Argentina/Buenos_Aires"
) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  return new Date(`${y}-${m}-${day}T00:00:00-03:00`);
}

export function daysAgo(n: number) {
  const today = startOfDay();
  return new Date(today.getTime() - n * 24 * 60 * 60 * 1000);
}
