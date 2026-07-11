import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { daysAgo, startOfDay, COUNTED_STATUSES } from "@/lib/orders";

const COUNTED: string[] = [...COUNTED_STATUSES];

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const now = new Date();
  const today = startOfDay(now);
  const week = daysAgo(6);
  const month = daysAgo(29);

  const [products, orders, recent] = await Promise.all([
    db.product.findMany(),
    db.order.findMany({
      where: { createdAt: { gte: month } },
      include: { items: true },
      orderBy: { createdAt: "asc" },
    }),
    db.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const counted = orders.filter((o) => COUNTED.includes(o.status));
  const pending = await db.order.count({ where: { status: "pending" } });

  const revenueMonth = counted.reduce((s, o) => s + o.total, 0);
  const revenueWeek = counted
    .filter((o) => o.createdAt >= week)
    .reduce((s, o) => s + o.total, 0);
  const revenueToday = counted
    .filter((o) => o.createdAt >= today)
    .reduce((s, o) => s + o.total, 0);

  const ordersMonth = counted.length;
  const ordersWeek = counted.filter((o) => o.createdAt >= week).length;
  const ordersToday = counted.filter((o) => o.createdAt >= today).length;

  const byChannel = {
    whatsapp: counted.filter((o) => o.channel === "whatsapp").length,
    mercadopago: counted.filter((o) => o.channel === "mercadopago").length,
    manual: counted.filter((o) => o.channel === "manual").length,
  };

  const productSales = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const order of counted) {
    for (const item of order.items) {
      const key = item.productId || item.name;
      const prev = productSales.get(key) || { name: item.name, qty: 0, revenue: 0 };
      prev.qty += item.quantity;
      prev.revenue += item.price * item.quantity;
      productSales.set(key, prev);
    }
  }

  const topProducts = [...productSales.values()]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const last7: { date: string; label: string; total: number; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = daysAgo(i);
    const next = new Date(d.getTime() + 24 * 60 * 60 * 1000);
    const dayOrders = counted.filter((o) => o.createdAt >= d && o.createdAt < next);
    last7.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        weekday: "short",
        day: "numeric",
      }),
      total: dayOrders.reduce((s, o) => s + o.total, 0),
      count: dayOrders.length,
    });
  }

  return NextResponse.json({
    catalog: {
      total: products.length,
      active: products.filter((p) => p.active).length,
      featured: products.filter((p) => p.featured).length,
      hidden: products.filter((p) => !p.active).length,
      withoutImage: products.filter((p) => !p.imageUrl).length,
    },
    sales: {
      revenueToday,
      revenueWeek,
      revenueMonth,
      ordersToday,
      ordersWeek,
      ordersMonth,
      pending,
      byChannel,
    },
    last7,
    topProducts,
    recent,
  });
}
