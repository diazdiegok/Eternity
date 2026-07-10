"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/whatsapp";

type DashboardData = {
  catalog: {
    total: number;
    active: number;
    featured: number;
    hidden: number;
    withoutImage: number;
  };
  sales: {
    revenueToday: number;
    revenueWeek: number;
    revenueMonth: number;
    ordersToday: number;
    ordersWeek: number;
    ordersMonth: number;
    pending: number;
    byChannel: { whatsapp: number; mercadopago: number; manual: number };
  };
  last7: { date: string; label: string; total: number; count: number }[];
  topProducts: { name: string; qty: number; revenue: number }[];
  recent: {
    id: string;
    code: string;
    channel: string;
    status: string;
    total: number;
    createdAt: string;
    items: { name: string; quantity: number }[];
  }[];
};

const channelLabel: Record<string, string> = {
  whatsapp: "WhatsApp",
  mercadopago: "Mercado Pago",
  manual: "Manual",
};

const statusLabel: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  paid: "Pagado",
  completed: "Completado",
  cancelled: "Cancelado",
};

export function AdminDashboard({ onGoOrders }: { onGoOrders: () => void }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(async (r) => {
        if (!r.ok) throw new Error("No se pudo cargar el dashboard");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  }

  if (!data) {
    return <p className="text-sm text-[#8a7b6e]">Cargando dashboard...</p>;
  }

  const maxBar = Math.max(...data.last7.map((d) => d.total), 1);

  const cards = [
    { label: "Hoy", value: formatPrice(data.sales.revenueToday), sub: `${data.sales.ordersToday} ventas` },
    { label: "Esta semana", value: formatPrice(data.sales.revenueWeek), sub: `${data.sales.ordersWeek} ventas` },
    { label: "Últimos 30 días", value: formatPrice(data.sales.revenueMonth), sub: `${data.sales.ordersMonth} ventas` },
    { label: "Pendientes", value: String(data.sales.pending), sub: "por revisar", accent: true },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border p-4 ${
              card.accent
                ? "border-[#d4b896] bg-[#f5ebe3]"
                : "border-[#e4d5c5] bg-white"
            }`}
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#a67c52]">
              {card.label}
            </p>
            <p className="mt-2 font-serif text-2xl text-[#4a3b30]">{card.value}</p>
            <p className="mt-1 text-sm text-[#8a7b6e]">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#e4d5c5] bg-white p-5">
          <h3 className="font-serif text-xl text-[#4a3b30]">Ventas web (7 días)</h3>
          <p className="mt-1 text-sm text-[#8a7b6e]">
            Solo pedidos confirmados, pagados o completados
          </p>
          <div className="mt-6 flex h-40 items-end gap-2">
            {data.last7.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-[#4a3b30] transition"
                  style={{ height: `${Math.max((day.total / maxBar) * 100, day.total > 0 ? 8 : 2)}%` }}
                  title={formatPrice(day.total)}
                />
                <span className="text-[10px] capitalize text-[#8a7b6e]">{day.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#e4d5c5] bg-white p-5">
          <h3 className="font-serif text-xl text-[#4a3b30]">Canales</h3>
          <ul className="mt-4 space-y-3">
            {Object.entries(data.sales.byChannel).map(([key, value]) => (
              <li key={key} className="flex items-center justify-between text-sm">
                <span className="text-[#6d5c4d]">{channelLabel[key] || key}</span>
                <span className="font-medium text-[#4a3b30]">{value} ventas</span>
              </li>
            ))}
          </ul>

          <h3 className="mt-8 font-serif text-xl text-[#4a3b30]">Catálogo</h3>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <p className="rounded-xl bg-[#f7f1ea] px-3 py-2 text-[#6d5c4d]">
              Activos: <strong className="text-[#4a3b30]">{data.catalog.active}</strong>
            </p>
            <p className="rounded-xl bg-[#f7f1ea] px-3 py-2 text-[#6d5c4d]">
              Ocultos: <strong className="text-[#4a3b30]">{data.catalog.hidden}</strong>
            </p>
            <p className="rounded-xl bg-[#f7f1ea] px-3 py-2 text-[#6d5c4d]">
              Destacados: <strong className="text-[#4a3b30]">{data.catalog.featured}</strong>
            </p>
            <p className="rounded-xl bg-[#f7f1ea] px-3 py-2 text-[#6d5c4d]">
              Sin foto: <strong className="text-[#4a3b30]">{data.catalog.withoutImage}</strong>
            </p>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#e4d5c5] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-serif text-xl text-[#4a3b30]">Más vendidos</h3>
          </div>
          {data.topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-[#8a7b6e]">Todavía no hay ventas registradas.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.topProducts.map((p) => (
                <li key={p.name} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium text-[#4a3b30]">{p.name}</p>
                    <p className="text-[#8a7b6e]">{p.qty} unidades</p>
                  </div>
                  <p className="shrink-0 text-[#4a3b30]">{formatPrice(p.revenue)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-[#e4d5c5] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-serif text-xl text-[#4a3b30]">Últimos pedidos</h3>
            <button
              type="button"
              onClick={onGoOrders}
              className="text-sm text-[#a67c52] hover:underline"
            >
              Ver todos
            </button>
          </div>
          {data.recent.length === 0 ? (
            <p className="mt-4 text-sm text-[#8a7b6e]">
              Cuando alguien compre por la web, aparece acá.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.recent.map((o) => (
                <li key={o.id} className="rounded-xl border border-[#efe4d8] px-3 py-2.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-[#4a3b30]">{o.code}</p>
                    <p className="text-[#4a3b30]">{formatPrice(o.total)}</p>
                  </div>
                  <p className="mt-1 text-[#8a7b6e]">
                    {channelLabel[o.channel] || o.channel} · {statusLabel[o.status] || o.status}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
