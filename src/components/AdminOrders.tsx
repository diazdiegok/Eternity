"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/whatsapp";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type Product = {
  id: string;
  name: string;
  price: number;
  active: boolean;
};

type OrderItem = {
  id: string;
  productId?: string | null;
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

type EditItem = {
  productId: string;
  name: string;
  price: string;
  quantity: string;
};

const STATUSES = [
  { value: "pending", label: "Pendiente" },
  { value: "completed", label: "Completado" },
  { value: "cancelled", label: "Cancelado" },
];

const channelLabel: Record<string, string> = {
  whatsapp: "Solo WEB",
  mercadopago: "MP",
  manual: "Manual",
};

function toOrderStatus(status: string) {
  if (status === "cancelled") return "cancelled";
  if (status === "pending") return "pending";
  return "completed";
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[#e8ddd3] bg-[#faf6f1] px-3 py-2.5 text-[#5c4a3d] outline-none transition focus:border-[#c9956a] focus:ring-2 focus:ring-[#c9956a]/20";

function toDatetimeLocalValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    customerName: "",
    customerPhone: "",
    customerNote: "",
    status: "completed",
    createdAt: "",
  });
  const [editItems, setEditItems] = useState<EditItem[]>([]);
  const [editSaving, setEditSaving] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      return orders.filter((o) => o.channel === "whatsapp");
    }
    return orders.filter((o) => o.status === filter || o.channel === filter);
  }, [orders, filter]);

  const editTotal = useMemo(
    () =>
      editItems.reduce(
        (sum, item) =>
          sum + (Number(item.price) || 0) * Math.max(1, Number(item.quantity) || 1),
        0
      ),
    [editItems]
  );

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

  function startEdit(order: Order) {
    setEditingId(order.id);
    setEditForm({
      customerName: order.customerName || "",
      customerPhone: order.customerPhone || "",
      customerNote: order.customerNote || "",
      status: toOrderStatus(order.status),
      createdAt: toDatetimeLocalValue(order.createdAt),
    });
    setEditItems(
      order.items.map((item) => ({
        productId: item.productId || "",
        name: item.name,
        price: String(item.price),
        quantity: String(item.quantity),
      }))
    );
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditItems([]);
  }

  function updateEditItem(index: number, patch: Partial<EditItem>) {
    setEditItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  function addEditItem() {
    const first = activeProducts[0];
    setEditItems((prev) => [
      ...prev,
      {
        productId: first?.id || "",
        name: first?.name || "Producto",
        price: String(first?.price ?? 0),
        quantity: "1",
      },
    ]);
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    if (!editItems.length) {
      setMessage("Agregá al menos un ítem");
      return;
    }

    setEditSaving(true);
    setMessage("");
    const res = await fetch(`/api/admin/orders/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        customerName: editForm.customerName,
        customerPhone: editForm.customerPhone,
        customerNote: editForm.customerNote,
        createdAt: editForm.createdAt
          ? new Date(editForm.createdAt).toISOString()
          : undefined,
        items: editItems.map((item) => ({
          productId: item.productId || null,
          name: item.name,
          price: Number(item.price),
          quantity: Math.max(1, Number(item.quantity) || 1),
        })),
      }),
    });
    setEditSaving(false);

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setMessage(json.error || "No se pudo guardar el pedido");
      return;
    }

    const updated = await res.json();
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setMessage("Pedido actualizado");
    cancelEdit();
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setDeleting(true);
    await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
    setOrders((prev) => prev.filter((o) => o.id !== id));
    if (editingId === id) cancelEdit();
    setPendingDeleteId(null);
    setDeleting(false);
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
        status: "completed",
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
        {message && !editingId && (
          <p className="mt-2 text-sm text-[#6d5c4d]">{message}</p>
        )}
      </form>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-serif text-xl text-[#4a3b30]">
            Pedidos ({filtered.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              ["all", "Todos"],
              ["manual", "Manual"],
              ["web", "Solo WEB"],
              ["pending", "Pendientes"],
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
            Todavía no hay pedidos. Cuando alguien finalice desde la web, se
            listan acá.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-[#e4d5c5] bg-white p-4"
              >
                {editingId === order.id ? (
                  <form onSubmit={handleSaveEdit} className="space-y-4">
                    <p className="font-medium text-[#4a3b30]">
                      Editando {order.code}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="text-sm font-medium text-[#5c4a3d]">
                        Cliente
                        <input
                          value={editForm.customerName}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              customerName: e.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </label>
                      <label className="text-sm font-medium text-[#5c4a3d]">
                        Teléfono
                        <input
                          value={editForm.customerPhone}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              customerPhone: e.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </label>
                      <label className="text-sm font-medium text-[#5c4a3d] sm:col-span-2">
                        Nota
                        <input
                          value={editForm.customerNote}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              customerNote: e.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </label>
                      <label className="text-sm font-medium text-[#5c4a3d]">
                        Estado
                        <select
                          value={editForm.status}
                          onChange={(e) =>
                            setEditForm({ ...editForm, status: e.target.value })
                          }
                          className={inputClass}
                        >
                          {STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm font-medium text-[#5c4a3d]">
                        Fecha
                        <input
                          type="datetime-local"
                          value={editForm.createdAt}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              createdAt: e.target.value,
                            })
                          }
                          className={inputClass}
                          required
                        />
                      </label>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#5c4a3d]">Ítems</p>
                        <button
                          type="button"
                          onClick={addEditItem}
                          className="text-sm text-[#8b6914] hover:underline"
                        >
                          + Agregar ítem
                        </button>
                      </div>
                      {editItems.map((item, index) => (
                        <div
                          key={index}
                          className="grid gap-2 rounded-xl bg-[#faf6f1] p-3 sm:grid-cols-12"
                        >
                          <label className="text-xs font-medium text-[#5c4a3d] sm:col-span-5">
                            Producto
                            <select
                              value={item.productId}
                              onChange={(e) => {
                                const product = activeProducts.find(
                                  (p) => p.id === e.target.value
                                );
                                updateEditItem(index, {
                                  productId: e.target.value,
                                  name: product?.name || item.name,
                                  price: String(product?.price ?? item.price),
                                });
                              }}
                              className={inputClass}
                            >
                              <option value="">Personalizado</option>
                              {activeProducts.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="text-xs font-medium text-[#5c4a3d] sm:col-span-3">
                            Nombre
                            <input
                              value={item.name}
                              onChange={(e) =>
                                updateEditItem(index, { name: e.target.value })
                              }
                              className={inputClass}
                              required
                            />
                          </label>
                          <label className="text-xs font-medium text-[#5c4a3d] sm:col-span-2">
                            Precio
                            <input
                              type="number"
                              min="0"
                              value={item.price}
                              onChange={(e) =>
                                updateEditItem(index, { price: e.target.value })
                              }
                              className={inputClass}
                              required
                            />
                          </label>
                          <label className="text-xs font-medium text-[#5c4a3d] sm:col-span-1">
                            Cant.
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateEditItem(index, {
                                  quantity: e.target.value,
                                })
                              }
                              className={inputClass}
                              required
                            />
                          </label>
                          <div className="flex items-end sm:col-span-1">
                            <button
                              type="button"
                              onClick={() =>
                                setEditItems((prev) =>
                                  prev.filter((_, i) => i !== index)
                                )
                              }
                              className="mb-1 rounded-full border border-red-200 px-2 py-2 text-xs text-red-600"
                              disabled={editItems.length <= 1}
                            >
                              X
                            </button>
                          </div>
                        </div>
                      ))}
                      <p className="text-sm font-medium text-[#4a3b30]">
                        Total: {formatPrice(editTotal)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="submit"
                        disabled={editSaving}
                        className="rounded-full bg-[#4a3b30] px-4 py-2 text-sm text-white disabled:opacity-60"
                      >
                        {editSaving ? "Guardando..." : "Guardar cambios"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-full border border-[#e4d5c5] px-4 py-2 text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                    {message && editingId && (
                      <p className="text-sm text-[#6d5c4d]">{message}</p>
                    )}
                  </form>
                ) : (
                  <>
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
                            {[order.customerName, order.customerPhone]
                              .filter(Boolean)
                              .join(" · ")}
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
                        value={toOrderStatus(order.status)}
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
                        onClick={() => startEdit(order)}
                        className="rounded-full border border-[#e4d5c5] px-3 py-1.5 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(order.id)}
                        className="rounded-full border border-red-200 px-3 py-1.5 text-sm text-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        title="Eliminar pedido"
        message="¿Eliminar este pedido? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
