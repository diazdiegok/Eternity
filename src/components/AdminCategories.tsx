"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type CategoryRow = {
  id: string;
  name: string;
  count: number;
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[#e8ddd3] bg-[#faf6f1] px-3 py-2.5 text-[#5c4a3d] outline-none transition focus:border-[#c9956a] focus:ring-2 focus:ring-[#c9956a]/20";

export function AdminCategories({
  onChanged,
}: {
  onChanged: () => Promise<void> | void;
}) {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [moveTo, setMoveTo] = useState("General");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    if (res.ok) setCategories(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(name: string) {
    setEditing(name);
    setEditName(name);
    setDeleting(null);
    setMessage("");
  }

  function startDelete(name: string) {
    setDeleting(name);
    setEditing(null);
    const fallback =
      categories.find((c) => c.name !== name)?.name || "General";
    setMoveTo(fallback);
    setMessage("");
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) {
      setMessage("Escribí un nombre");
      return;
    }

    setBusy(true);
    setMessage("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      setMessage(json.error || "No se pudo crear");
      return;
    }

    setNewName("");
    setMessage(`Categoría creada: "${json.name}"`);
    await load();
    await onChanged();
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const to = editName.trim();
    if (!to) {
      setMessage("Escribí un nombre");
      return;
    }
    if (to === editing) {
      setEditing(null);
      return;
    }

    setBusy(true);
    setMessage("");
    const res = await fetch("/api/admin/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: editing, to }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      setMessage(json.error || "No se pudo editar");
      return;
    }

    setMessage(
      `Categoría actualizada: "${editing}" → "${to}" (${json.updated || 0} productos)`
    );
    setEditing(null);
    await load();
    await onChanged();
  }

  async function handleConfirmDelete(e: FormEvent) {
    e.preventDefault();
    if (!deleting) return;

    setBusy(true);
    setMessage("");
    const res = await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: deleting, moveTo }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      setMessage(json.error || "No se pudo eliminar");
      return;
    }

    setMessage(
      json.moved
        ? `Eliminada "${deleting}". ${json.moved} productos pasaron a "${json.moveTo}"`
        : `Eliminada "${deleting}"`
    );
    setDeleting(null);
    await load();
    await onChanged();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-[#e8ddd3] bg-white p-6 shadow-sm"
      >
        <h2 className="font-serif text-xl text-stone-800">Nueva categoría</h2>
        <p className="mt-1 text-sm text-[#9a8b7e]">
          Creá categorías acá. En Productos solo se eligen las existentes.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1 text-sm font-medium text-[#5c4a3d]">
            Nombre
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej: Plata 925"
              className={inputClass}
              required
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-[#5c4a3d] px-5 py-2.5 text-sm text-white disabled:opacity-50"
          >
            {busy ? "Creando..." : "Crear categoría"}
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-[#e8ddd3] bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl text-stone-800">Categorías</h2>
        <p className="mt-1 text-sm text-[#9a8b7e]">
          Editá el nombre o borrá una categoría. Al borrar, los productos se
          mueven a otra.
        </p>

        {loading ? (
          <p className="mt-4 text-sm text-[#8a7b6e]">Cargando...</p>
        ) : categories.length === 0 ? (
          <p className="mt-4 text-sm text-[#8a7b6e]">
            Todavía no hay categorías. Creá la primera arriba.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {categories.map(({ name, count }) => (
              <li
                key={name}
                className="rounded-2xl border border-[#efe4d8] bg-[#faf6f1]/60 p-4"
              >
                {editing === name ? (
                  <form onSubmit={handleSaveEdit} className="space-y-3">
                    <label className="block text-sm font-medium text-[#5c4a3d]">
                      Nuevo nombre
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={inputClass}
                        autoFocus
                        required
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="submit"
                        disabled={busy}
                        className="rounded-full bg-[#5c4a3d] px-4 py-2 text-sm text-white disabled:opacity-50"
                      >
                        {busy ? "Guardando..." : "Guardar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="rounded-full border border-[#e4d5c5] px-4 py-2 text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : deleting === name ? (
                  <form onSubmit={handleConfirmDelete} className="space-y-3">
                    <p className="text-sm text-[#5c4a3d]">
                      ¿Borrar <strong>{name}</strong>?{" "}
                      {count > 0
                        ? `${count} producto(s) se moverán a:`
                        : "No tiene productos."}
                    </p>
                    {count > 0 && (
                      <label className="block text-sm font-medium text-[#5c4a3d]">
                        Mover productos a
                        <select
                          value={moveTo}
                          onChange={(e) => setMoveTo(e.target.value)}
                          className={`${inputClass} cursor-pointer`}
                        >
                          {categories
                            .filter((c) => c.name !== name)
                            .map((c) => (
                              <option key={c.name} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          {!categories.some(
                            (c) => c.name !== name && c.name === "General"
                          ) && <option value="General">General</option>}
                        </select>
                      </label>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="submit"
                        disabled={busy}
                        className="rounded-full bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                      >
                        {busy ? "Eliminando..." : "Confirmar borrado"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(null)}
                        className="rounded-full border border-[#e4d5c5] px-4 py-2 text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#4a3b30]">{name}</p>
                      <p className="text-sm text-[#8a7b6e]">
                        {count} {count === 1 ? "producto" : "productos"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(name)}
                        className="rounded-full border border-[#e4d5c5] px-3 py-1.5 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => startDelete(name)}
                        className="rounded-full border border-red-200 px-3 py-1.5 text-sm text-red-600"
                      >
                        Borrar
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {message && (
          <p className="mt-4 text-sm text-green-700">{message}</p>
        )}
      </div>
    </div>
  );
}
