"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Promotion = {
  id: string;
  name: string;
  categories: string[];
  percentOff: number;
  hours: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[#e8ddd3] bg-[#faf6f1] px-3 py-2.5 text-[#5c4a3d] outline-none transition focus:border-[#c9956a] focus:ring-2 focus:ring-[#c9956a]/20";

export function AdminPromotions({ categories }: { categories: string[] }) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [percentOff, setPercentOff] = useState("20");
  const [hours, setHours] = useState("24");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const categoryList = useMemo(
    () => [...new Set(categories.filter(Boolean))].sort(),
    [categories]
  );

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/promotions");
    if (res.ok) setPromotions(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function toggleCategory(cat: string) {
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        categories: selected,
        percentOff: Number(percentOff),
        hours: Number(hours),
      }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setMessage(json.error || "No se pudo crear la promoción");
      return;
    }
    setSelected([]);
    setPercentOff("20");
    setHours("24");
    setName("");
    setMessage(
      `Promoción activa: −${json.percentOff}% por ${json.hours}h en ${json.categories.join(", ")}`
    );
    await load();
  }

  async function endPromo(id: string) {
    await fetch(`/api/admin/promotions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: false }),
    });
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta promoción?")) return;
    await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
    await load();
  }

  const now = Date.now();

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-[#e8ddd3] bg-white p-6 shadow-sm"
      >
        <h2 className="font-serif text-xl text-stone-800">Nueva promoción HOT</h2>
        <p className="mt-1 text-sm text-[#9a8b7e]">
          Elegí categorías, el % de descuento y durante cuántas horas corre.
        </p>

        <label className="mt-4 block text-sm font-medium text-[#5c4a3d]">
          Nombre (opcional)
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Flash weekend"
            className={inputClass}
          />
        </label>

        <div className="mt-4">
          <p className="text-sm font-medium text-[#5c4a3d]">Categorías</p>
          {categoryList.length === 0 ? (
            <p className="mt-2 text-sm text-[#9a8b7e]">
              Todavía no hay categorías en productos.
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {categoryList.map((cat) => {
                const on = selected.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`rounded-full px-3 py-1.5 text-sm transition ${
                      on
                        ? "bg-[#c45c26] text-white"
                        : "bg-[#faf6f1] text-[#5c4a3d] ring-1 ring-[#e8ddd3]"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
          <label className="block text-sm font-medium text-[#5c4a3d]">
            Duración (horas)
            <input
              type="number"
              min="1"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className={inputClass}
              required
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving || selected.length === 0}
          className="mt-4 rounded-full bg-[#c45c26] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#a84c1f] disabled:opacity-50"
        >
          {saving ? "Activando..." : "🔥 Activar promoción"}
        </button>
        {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
      </form>

      <section>
        <h3 className="font-serif text-xl text-[#4a3b30]">
          Promociones ({promotions.length})
        </h3>
        {loading ? (
          <p className="mt-3 text-sm text-[#8a7b6e]">Cargando...</p>
        ) : promotions.length === 0 ? (
          <p className="mt-3 text-sm text-[#8a7b6e]">Todavía no hay promociones.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {promotions.map((promo) => {
              const live =
                promo.active && new Date(promo.endsAt).getTime() > now;
              return (
                <article
                  key={promo.id}
                  className="rounded-2xl border border-[#e8ddd3] bg-white p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#4a3b30]">
                        {promo.name || "Promoción"}{" "}
                        <span className="text-[#c45c26]">
                          −{promo.percentOff}%
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-[#6d5c4d]">
                        {promo.categories.join(" · ")}
                      </p>
                      <p className="mt-1 text-xs text-[#8a7b6e]">
                        {live ? "En curso" : "Finalizada"} · {promo.hours}h · hasta{" "}
                        {new Date(promo.endsAt).toLocaleString("es-AR")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {live && (
                        <button
                          type="button"
                          onClick={() => endPromo(promo.id)}
                          className="rounded-full border border-[#e4d5c5] px-3 py-1.5 text-sm"
                        >
                          Cortar ahora
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(promo.id)}
                        className="rounded-full border border-red-200 px-3 py-1.5 text-sm text-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
