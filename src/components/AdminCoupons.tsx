"use client";

import { FormEvent, useEffect, useState } from "react";

type Coupon = {
  id: string;
  code: string;
  percentOff: number;
  active: boolean;
  createdAt: string;
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[#e8ddd3] bg-[#faf6f1] px-3 py-2.5 text-[#5c4a3d] outline-none transition focus:border-[#c9956a] focus:ring-2 focus:ring-[#c9956a]/20";

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [code, setCode] = useState("");
  const [percentOff, setPercentOff] = useState("10");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/coupons");
    if (res.ok) setCoupons(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        percentOff: Number(percentOff),
      }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setMessage(json.error || "No se pudo crear");
      return;
    }
    setCode("");
    setPercentOff("10");
    setMessage(`Cupón ${json.code} creado (−${json.percentOff}%)`);
    await load();
  }

  async function toggleActive(coupon: Coupon) {
    await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !coupon.active }),
    });
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este cupón?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-[#e8ddd3] bg-white p-6 shadow-sm"
      >
        <h2 className="font-serif text-xl text-stone-800">Nuevo cupón</h2>
        <p className="mt-1 text-sm text-[#9a8b7e]">
          El cliente lo ingresa en el carrito y se descuenta el %.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-[#5c4a3d]">
            Código
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="EJ: ETERNITY10"
              className={inputClass}
              required
            />
          </label>
          <label className="block text-sm font-medium text-[#5c4a3d]">
            Descuento (%)
            <input
              type="number"
              min="1"
              max="100"
              value={percentOff}
              onChange={(e) => setPercentOff(e.target.value)}
              className={inputClass}
              required
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-4 rounded-full bg-[#5c4a3d] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#4a3b30] disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Crear cupón"}
        </button>
        {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
      </form>

      <section>
        <h3 className="font-serif text-xl text-[#4a3b30]">
          Cupones ({coupons.length})
        </h3>
        {loading ? (
          <p className="mt-3 text-sm text-[#8a7b6e]">Cargando...</p>
        ) : coupons.length === 0 ? (
          <p className="mt-3 text-sm text-[#8a7b6e]">Todavía no hay cupones.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {coupons.map((coupon) => (
              <article
                key={coupon.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e8ddd3] bg-white p-4"
              >
                <div>
                  <p className="font-medium text-[#4a3b30]">
                    {coupon.code}{" "}
                    <span className="text-[#a67c52]">−{coupon.percentOff}%</span>
                  </p>
                  <p className="text-sm text-[#8a7b6e]">
                    {coupon.active ? "Activo" : "Inactivo"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleActive(coupon)}
                    className="rounded-full border border-[#e4d5c5] px-3 py-1.5 text-sm"
                  >
                    {coupon.active ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(coupon.id)}
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
