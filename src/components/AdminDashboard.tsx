"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/whatsapp";

type ChannelStat = { count: number; revenue: number };

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
    avgTicket: number;
    pending: number;
    byChannel: {
      whatsapp: ChannelStat;
      mercadopago: ChannelStat;
      manual: ChannelStat;
    };
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
  pendingPreview: {
    id: string;
    code: string;
    channel: string;
    total: number;
    createdAt: string;
    customerName: string | null;
    items: { name: string; quantity: number }[];
  }[];
};

const channelLabel: Record<string, string> = {
  whatsapp: "WEB",
  mercadopago: "MP",
  manual: "Manual",
};

const statusLabel: Record<string, string> = {
  pending: "Pendiente",
  completed: "Completado",
  cancelled: "Cancelado",
  confirmed: "Completado",
  paid: "Completado",
};

function shortDay(label: string) {
  const part = label.split(" ")[0] || label;
  return part.replace(".", "").slice(0, 3);
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? "hace un momento" : `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "ayer" : `hace ${days} días`;
}

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

  const weekTotal = useMemo(
    () => (data ? data.last7.reduce((s, d) => s + d.total, 0) : 0),
    [data]
  );
  const weekOrders = useMemo(
    () => (data ? data.last7.reduce((s, d) => s + d.count, 0) : 0),
    [data]
  );
  const maxBar = useMemo(
    () => (data ? Math.max(...data.last7.map((d) => d.total), 1) : 1),
    [data]
  );
  const maxProduct = useMemo(
    () => (data ? Math.max(...data.topProducts.map((p) => p.revenue), 1) : 1),
    [data]
  );
  const channelTotal = useMemo(() => {
    if (!data) return 1;
    const sum = Object.values(data.sales.byChannel).reduce(
      (s, c) => s + c.count,
      0
    );
    return Math.max(sum, 1);
  }, [data]);

  if (error) {
    return (
      <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </p>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <div className="h-36 animate-pulse rounded-3xl bg-[#efe4d8]/70" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-3xl bg-[#efe4d8]/50 lg:col-span-2" />
          <div className="h-64 animate-pulse rounded-3xl bg-[#efe4d8]/50" />
        </div>
      </div>
    );
  }

  const channels = (
    Object.entries(data.sales.byChannel) as [string, ChannelStat][]
  ).sort((a, b) => b[1].revenue - a[1].revenue);

  return (
    <div className="space-y-6">
      {/* Resumen principal */}
      <section className="overflow-hidden rounded-3xl border border-[#e4d5c5] bg-[linear-gradient(135deg,#fffdf9_0%,#f5ebe3_55%,#efe0d2_100%)] p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#a67c52]">
              Últimos 30 días
            </p>
            <p className="mt-2 font-serif text-4xl text-[#4a3b30] sm:text-5xl">
              {formatPrice(data.sales.revenueMonth)}
            </p>
            <p className="mt-2 text-sm text-[#6d5c4d]">
              {data.sales.ordersMonth}{" "}
              {data.sales.ordersMonth === 1 ? "venta" : "ventas"}
              {data.sales.avgTicket > 0 && (
                <>
                  {" "}
                  · ticket promedio{" "}
                  <span className="font-medium text-[#4a3b30]">
                    {formatPrice(data.sales.avgTicket)}
                  </span>
                </>
              )}
            </p>
          </div>

          {data.sales.pending > 0 ? (
            <button
              type="button"
              onClick={onGoOrders}
              className="rounded-2xl border border-[#d4b896] bg-white/80 px-4 py-3 text-left shadow-sm transition hover:bg-white"
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#a67c52]">
                Atención
              </p>
              <p className="mt-1 font-serif text-2xl text-[#4a3b30]">
                {data.sales.pending} pendiente
                {data.sales.pending === 1 ? "" : "s"}
              </p>
              <p className="mt-1 text-sm text-[#8b6914]">Revisar ventas →</p>
            </button>
          ) : (
            <div className="rounded-2xl border border-[#e4d5c5] bg-white/70 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#a67c52]">
                Estado
              </p>
              <p className="mt-1 font-serif text-xl text-[#4a3b30]">
                Sin pendientes
              </p>
              <p className="mt-1 text-sm text-[#8a7b6e]">Todo al día</p>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            {
              label: "Hoy",
              value: formatPrice(data.sales.revenueToday),
              sub: `${data.sales.ordersToday} venta${data.sales.ordersToday === 1 ? "" : "s"}`,
            },
            {
              label: "Esta semana",
              value: formatPrice(data.sales.revenueWeek),
              sub: `${data.sales.ordersWeek} venta${data.sales.ordersWeek === 1 ? "" : "s"}`,
            },
            {
              label: "Catálogo",
              value: String(data.catalog.active),
              sub: `${data.catalog.featured} destacados · ${data.catalog.total} total`,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-white/70 bg-white/75 px-4 py-3 backdrop-blur-sm"
            >
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#a67c52]">
                {card.label}
              </p>
              <p className="mt-1.5 font-serif text-2xl text-[#4a3b30]">
                {card.value}
              </p>
              <p className="mt-0.5 text-sm text-[#8a7b6e]">{card.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Gráfico 7 días */}
        <section className="rounded-3xl border border-[#e4d5c5] bg-white p-5 sm:p-6 lg:col-span-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="font-serif text-2xl text-[#4a3b30]">
                Actividad de la semana
              </h3>
              <p className="mt-1 text-sm text-[#8a7b6e]">
                Ventas contadas · todos los canales
              </p>
            </div>
            <div className="text-right">
              <p className="font-serif text-2xl text-[#4a3b30]">
                {formatPrice(weekTotal)}
              </p>
              <p className="text-sm text-[#8a7b6e]">
                {weekOrders} {weekOrders === 1 ? "venta" : "ventas"}
              </p>
            </div>
          </div>

          <div className="mt-8 flex h-44 items-end gap-2 sm:gap-3">
            {data.last7.map((day) => {
              const height =
                day.total > 0
                  ? Math.max((day.total / maxBar) * 100, 10)
                  : 4;
              return (
                <div
                  key={day.date}
                  className="group relative flex h-full flex-1 flex-col items-center justify-end"
                >
                  <div className="pointer-events-none absolute bottom-[calc(100%+8px)] z-10 hidden min-w-[7rem] rounded-xl bg-[#4a3b30] px-3 py-2 text-center text-xs text-white shadow-lg group-hover:block">
                    <p className="font-medium">
                      {day.total > 0 ? formatPrice(day.total) : "Sin ventas"}
                    </p>
                    {day.count > 0 && (
                      <p className="mt-0.5 text-white/70">
                        {day.count} {day.count === 1 ? "venta" : "ventas"}
                      </p>
                    )}
                  </div>
                  <div
                    className={`w-full rounded-t-xl transition-all ${
                      day.total > 0
                        ? "bg-[linear-gradient(180deg,#8b6914_0%,#4a3b30_100%)]"
                        : "bg-[#efe4d8]"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  <p className="mt-2 text-[11px] capitalize text-[#8a7b6e]">
                    {shortDay(day.label)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Canales */}
        <section className="rounded-3xl border border-[#e4d5c5] bg-white p-5 sm:p-6 lg:col-span-2">
          <h3 className="font-serif text-2xl text-[#4a3b30]">Canales</h3>
          <p className="mt-1 text-sm text-[#8a7b6e]">Últimos 30 días</p>

          <ul className="mt-5 space-y-4">
            {channels.map(([key, stat]) => {
              const pct = Math.round((stat.count / channelTotal) * 100);
              return (
                <li key={key}>
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-medium text-[#4a3b30]">
                      {channelLabel[key] || key}
                    </span>
                    <span className="text-[#6d5c4d]">
                      {stat.count} · {formatPrice(stat.revenue)}
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#f0e6db]">
                    <div
                      className="h-full rounded-full bg-[#4a3b30]"
                      style={{ width: `${Math.max(pct, stat.count > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 grid grid-cols-2 gap-2 border-t border-[#efe4d8] pt-5 text-sm">
            <div className="rounded-xl bg-[#f7f1ea] px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wider text-[#a67c52]">
                Activos
              </p>
              <p className="mt-1 font-serif text-xl text-[#4a3b30]">
                {data.catalog.active}
              </p>
            </div>
            <div className="rounded-xl bg-[#f7f1ea] px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wider text-[#a67c52]">
                Destacados
              </p>
              <p className="mt-1 font-serif text-xl text-[#4a3b30]">
                {data.catalog.featured}
              </p>
            </div>
            <div className="rounded-xl bg-[#f7f1ea] px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wider text-[#a67c52]">
                Ocultos
              </p>
              <p className="mt-1 font-serif text-xl text-[#4a3b30]">
                {data.catalog.hidden}
              </p>
            </div>
            <div className="rounded-xl bg-[#f7f1ea] px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wider text-[#a67c52]">
                Sin foto
              </p>
              <p
                className={`mt-1 font-serif text-xl ${
                  data.catalog.withoutImage > 0
                    ? "text-[#8b6914]"
                    : "text-[#4a3b30]"
                }`}
              >
                {data.catalog.withoutImage}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Pendientes + top + recientes */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-3xl border border-[#e4d5c5] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-serif text-2xl text-[#4a3b30]">Pendientes</h3>
            {data.sales.pending > 0 && (
              <button
                type="button"
                onClick={onGoOrders}
                className="text-sm text-[#8b6914] hover:underline"
              >
                Ver todos
              </button>
            )}
          </div>

          {data.pendingPreview.length === 0 ? (
            <p className="mt-5 rounded-2xl bg-[#f7f1ea] px-4 py-5 text-sm text-[#8a7b6e]">
              No hay pedidos por revisar.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.pendingPreview.map((o) => (
                <li
                  key={o.id}
                  className="rounded-2xl border border-[#efe4d8] bg-[#faf6f1] px-3.5 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-[#4a3b30]">{o.code}</p>
                      <p className="mt-0.5 text-xs text-[#8a7b6e]">
                        {channelLabel[o.channel] || o.channel}
                        {o.customerName ? ` · ${o.customerName}` : ""}
                      </p>
                    </div>
                    <p className="shrink-0 font-medium text-[#4a3b30]">
                      {formatPrice(o.total)}
                    </p>
                  </div>
                  <p className="mt-2 truncate text-xs text-[#6d5c4d]">
                    {o.items
                      .map((i) => `${i.quantity}× ${i.name}`)
                      .join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-[#e4d5c5] bg-white p-5 sm:p-6">
          <h3 className="font-serif text-2xl text-[#4a3b30]">Más vendidos</h3>
          <p className="mt-1 text-sm text-[#8a7b6e]">Por facturación · 30 días</p>

          {data.topProducts.length === 0 ? (
            <p className="mt-5 text-sm text-[#8a7b6e]">
              Todavía no hay ventas registradas.
            </p>
          ) : (
            <ol className="mt-5 space-y-4">
              {data.topProducts.map((p, index) => (
                <li key={p.name}>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f5ebe3] font-serif text-sm text-[#4a3b30]">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate font-medium text-[#4a3b30]">
                          {p.name}
                        </p>
                        <p className="shrink-0 text-sm text-[#4a3b30]">
                          {formatPrice(p.revenue)}
                        </p>
                      </div>
                      <p className="mt-0.5 text-xs text-[#8a7b6e]">
                        {p.qty} {p.qty === 1 ? "unidad" : "unidades"}
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f0e6db]">
                        <div
                          className="h-full rounded-full bg-[#a67c52]"
                          style={{
                            width: `${Math.max((p.revenue / maxProduct) * 100, 6)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="rounded-3xl border border-[#e4d5c5] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-serif text-2xl text-[#4a3b30]">Últimos</h3>
            <button
              type="button"
              onClick={onGoOrders}
              className="text-sm text-[#8b6914] hover:underline"
            >
              Ventas
            </button>
          </div>

          {data.recent.length === 0 ? (
            <p className="mt-5 text-sm text-[#8a7b6e]">
              Cuando alguien compre por la web, aparece acá.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.recent.map((o) => (
                <li
                  key={o.id}
                  className="rounded-2xl border border-[#efe4d8] px-3.5 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-[#4a3b30]">{o.code}</p>
                    <p className="font-medium text-[#4a3b30]">
                      {formatPrice(o.total)}
                    </p>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#f5ebe3] px-2.5 py-0.5 text-[11px] font-medium text-[#4a3b30]">
                      {channelLabel[o.channel] || o.channel}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        o.status === "pending"
                          ? "bg-amber-50 text-amber-800"
                          : o.status === "cancelled"
                            ? "bg-red-50 text-red-700"
                            : "bg-emerald-50 text-emerald-800"
                      }`}
                    >
                      {statusLabel[o.status] || o.status}
                    </span>
                    <span className="text-[11px] text-[#8a7b6e]">
                      {relativeTime(o.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
