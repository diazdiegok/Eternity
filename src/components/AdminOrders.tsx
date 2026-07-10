"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/whatsapp";

type Product = {
  id: string;
  name: string;
  price: number;
  active: boolean;
};

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  code: string;
  channel: string;
  status: string;
  customerName: string | null;
  customerPhone: string | null;
  customerNote: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

const STATUSES = [
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "paid", label: "Pagado" },
  { value: "completed", label: "Completado" },
  { value: "cancelled", label: "Cancelado" },
];

const channelLabel: Record<string, string> = {
  whatsapp: "WhatsApp",
  mercadopago: "Mercado Pago",
  manual: "Manual",
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[#e8ddd3] bg-[#faf6f1] px-3 py-2.5 text-[#5c4a3d] outline-none transition focus:border-[#c9956a] focus:ring-2 focus:ring-[#c9956a]/20";

export function AdminOrders({ products }: { products: Product[] }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [manualProductId, setManualProductId] = useState("");
  const [manualQty, setManualQty] = useState("1");
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [saving, setSaving] = useState(false);

  const activeProducts = useMemo(
    () => products.filter((p) => p.active),
    [products]
  );

  async function loadOrders() {
    setLoading(true);
    const res = await fetch("/api/admin/orders");
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "web") {
      return orders.filter((o) => o.channel === "whatsapp" || o.channel === "mercadopago");
    }
    return orders.filter((o) => o.status === filter || o.channel === filter);
  }, [orders, filter]);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este pedido?")) return;
    await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  async function handleManualSale(e: FormEvent) {
    e.preventDefault();
    const product = activeProducts.find((p) => p.id === manualProductId);
    if (!product) {
      setMessage("Elegí un producto");
      return;
    }
    const quantity = Math.max(1, Number(manualQty) || 1);
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: manualName,
        customerPhone: manualPhone,
        customerNote: manualNote,
        status: "confirmed",
        items: [
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity,
          },
        ],
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setMessage(json.error || "Error al registrar");
      return;
    }
    setManualProductId("");
    setManualQty("1");
    setManualName("");
    setManualPhone("");
    setManualNote("");
    setMessage("Venta registrada");
    await loadOrders();
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleManualSale}
        className="rounded-2xl border border-[#e4d5c5] bg-white p-5"
      >
        <h3 className="font-serif text-xl text-[#4a3b30]">Registrar venta manual</h3>
        <p className="mt-1 text-sm text-[#8a7b6e]">
          Para ventas por WhatsApp fuera del carrito, ferias o pedidos directos.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-[#5c4a3d]">
            Producto *
            <select
              value={manualProductId}
              onChange={(e) => setManualProductId(e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Elegir...</option>
              {activeProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {formatPrice(p.price)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-[#5c4a3d]">
            Cantidad
            <input
              type="number"
              min="1"
              value={manualQty}
              onChange={(e) => setManualQty(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-medium text-[#5c4a3d]">
            Cliente
            <input
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              className={inputClass}
              placeholder="Nombre (opcional)"
            />
          </label>
          <label className="text-sm font-medium text-[#5c4a3d]">
            Teléfono
            <input
              value={manualPhone}
              onChange={(e) => setManualPhone(e.target.value)}
              className={inputClass}
              placeholder="WhatsApp (opcional)"
            />
          </label>
          <label className="text-sm font-medium text-[#5c4a3d] sm:col-span-2">
            Nota
            <input
              value={manualNote}
              onChange={(e) => setManualNote(e.target.value)}
              className={inputClass}
              placeholder="Detalle del pedido"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-4 rounded-full bg-[#4a3b30] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5c4a3d] disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Registrar venta"}
        </button>
        {message && <p className="mt-2 text-sm text-[#6d5c4d]">{message}</p>}
      </form>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-serif text-xl text-[#4a3b30]">
            Pedidos ({filtered.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              ["all", "Todos"],
              ["web", "Solo web"],
              ["pending", "Pendientes"],
              ["whatsapp", "WhatsApp"],
              ["mercadopago", "MP"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-full px-3 py-1.5 text-xs transition ${
                  filter === value
                    ? "bg-[#4a3b30] text-white"
                    : "bg-white text-[#6d5c4d] ring-1 ring-[#e4d5c5]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-[#8a7b6e]">Cargando pedidos...</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d4b896] bg-white p-8 text-center text-sm text-[#8a7b6e]">
            Todavía no hay pedidos. Cuando alguien finalice por WhatsApp o Mercado Pago, se listan acá.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-[#e4d5c5] bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#4a3b30]">
                      {order.code}{" "}
                      <span className="text-sm font-normal text-[#8a7b6e]">
                        · {channelLabel[order.channel] || order.channel}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-[#8a7b6e]">
                      {new Date(order.createdAt).toLocaleString("es-AR")}
                    </p>
                    {(order.customerName || order.customerPhone) && (
                      <p className="mt-1 text-sm text-[#6d5c4d]">
                        {[order.customerName, order.customerPhone].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  <p className="font-serif text-xl text-[#4a3b30]">
                    {formatPrice(order.total)}
                  </p>
                </div>

                <ul className="mt-3 space-y-1 text-sm text-[#6d5c4d]">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.quantity}× {item.name} · {formatPrice(item.price)}
                    </li>
                  ))}
                </ul>

                {order.customerNote && (
                  <p className="mt-2 rounded-xl bg-[#f7f1ea] px-3 py-2 text-sm text-[#6d5c4d]">
                    Nota: {order.customerNote}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="rounded-full border border-[#e4d5c5] bg-[#faf6f1] px-3 py-1.5 text-sm text-[#4a3b30]"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleDelete(order.id)}
                    className="rounded-full border border-red-200 px-3 py-1.5 text-sm text-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
