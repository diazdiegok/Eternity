"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/whatsapp";
import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminOrders } from "@/components/AdminOrders";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category: string;
  featured: boolean;
  active: boolean;
};

const CATEGORY_SUGGESTIONS = ["Sin Bordes", "Bordes de Acero", "Plata 925", "Mascotas"];
const CUSTOM_CATEGORY = "__custom__";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "Sin Bordes",
  featured: false,
  active: true,
  imageUrl: "" as string | null,
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[#e8ddd3] bg-[#faf6f1] px-3 py-2.5 text-[#5c4a3d] outline-none transition focus:border-[#c9956a] focus:ring-2 focus:ring-[#c9956a]/20";

export function AdminPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [loginStep, setLoginStep] = useState<"password" | "totp">("password");
  const [loginError, setLoginError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [categoryMode, setCategoryMode] = useState<"preset" | "custom">("preset");
  const [customCategory, setCustomCategory] = useState("");
  const [tab, setTab] = useState<"dashboard" | "orders" | "products" | "categories">(
    "dashboard"
  );
  const [renameFrom, setRenameFrom] = useState("");
  const [renameTo, setRenameTo] = useState("");
  const [renaming, setRenaming] = useState(false);

  const categoryOptions = useMemo(() => {
    const fromProducts = products.map((p) => p.category);
    return [...new Set([...CATEGORY_SUGGESTIONS, ...fromProducts])].sort();
  }, [products]);

  async function loadProducts() {
    const res = await fetch("/api/admin/products");
    if (res.status === 401) {
      setAuthenticated(false);
      return;
    }
    setAuthenticated(true);
    setProducts(await res.json());
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoginError(json.error || "Contraseña incorrecta");
      return;
    }
    if (json.requiresTotp) {
      setPassword("");
      setLoginStep("totp");
      return;
    }
    setPassword("");
    await loadProducts();
  }

  async function handleTotpVerify(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/verify-totp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: totpCode }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoginError(json.error || "Código incorrecto");
      return;
    }
    setTotpCode("");
    setLoginStep("password");
    await loadProducts();
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setLoginStep("password");
    setTotpCode("");
    setProducts([]);
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setSelectedFileName(file.name);
    const data = new FormData();
    data.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: data });
    const json = await res.json();
    setUploading(false);
    if (json.url) {
      setForm((f) => ({ ...f, imageUrl: json.url }));
    } else {
      alert(json.error || "Error al subir imagen");
      setSelectedFileName("");
    }
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    const isPreset = categoryOptions.includes(product.category);
    setCategoryMode(isPreset ? "preset" : "custom");
    setCustomCategory(isPreset ? "" : product.category);
    setSelectedFileName("");
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      featured: product.featured,
      active: product.active,
      imageUrl: product.imageUrl,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setCategoryMode("preset");
    setCustomCategory("");
    setSelectedFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function getFinalCategory() {
    return categoryMode === "custom" ? customCategory.trim() : form.category;
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const category = getFinalCategory();
    if (!category) {
      setMessage("Elegí o escribí una categoría");
      return;
    }

    setSaving(true);
    setMessage("");

    const payload = {
      ...form,
      category,
      price: Number(form.price),
    };

    const res = await fetch(
      editingId ? `/api/admin/products/${editingId}` : "/api/admin/products",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    setSaving(false);
    if (!res.ok) {
      const json = await res.json();
      setMessage(json.error || "Error al guardar");
      return;
    }

    setMessage(editingId ? "Producto actualizado" : "Producto creado");
    resetForm();
    await loadProducts();
  }

  async function toggleActive(product: Product) {
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !product.active }),
    });
    await loadProducts();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    await loadProducts();
  }

  async function handleRenameCategory(e: FormEvent) {
    e.preventDefault();
    const from = renameFrom.trim();
    const to = renameTo.trim();
    if (!from || !to) {
      setMessage("Elegí la categoría y el nombre nuevo");
      return;
    }
    if (from === to) {
      setMessage("El nombre nuevo debe ser distinto");
      return;
    }

    setRenaming(true);
    setMessage("");
    const res = await fetch("/api/admin/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to }),
    });
    const json = await res.json().catch(() => ({}));
    setRenaming(false);

    if (!res.ok) {
      setMessage(json.error || "No se pudo renombrar");
      return;
    }

    setMessage(
      json.updated
        ? `Categoría renombrada: "${from}" → "${to}" (${json.updated} productos)`
        : `No había productos en "${from}"`
    );
    setRenameFrom("");
    setRenameTo("");
    if (form.category === from) {
      setForm((f) => ({ ...f, category: to }));
    }
    await loadProducts();
  }

  if (authenticated === null) {
    return <p className="p-8 text-center text-stone-500">Cargando...</p>;
  }

  if (!authenticated) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16">
        {loginStep === "password" ? (
          <form
            onSubmit={handleLogin}
            className="w-full rounded-2xl border border-stone-200 bg-white p-8 shadow-sm"
          >
            <h1 className="font-serif text-3xl text-stone-800">Panel admin</h1>
            <p className="mt-2 text-sm text-stone-500">
              Acceso solo para administradores de Eternity Recuerdos
            </p>
            <label className="mt-6 block text-sm font-medium text-stone-700">
              Contraseña
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                required
                autoComplete="current-password"
              />
            </label>
            {loginError && (
              <p className="mt-2 text-sm text-red-600">{loginError}</p>
            )}
            <button
              type="submit"
              className="mt-6 w-full rounded-full bg-stone-900 py-3 font-medium text-white hover:bg-[#8b6914]"
            >
              Ingresar
            </button>
            <Link href="/" className="mt-4 block text-center text-sm text-stone-500 hover:underline">
              Volver al catálogo
            </Link>
          </form>
        ) : (
          <form
            onSubmit={handleTotpVerify}
            className="w-full rounded-2xl border border-stone-200 bg-white p-8 shadow-sm"
          >
            <h1 className="font-serif text-3xl text-stone-800">Verificación 2FA</h1>
            <p className="mt-2 text-sm text-stone-500">
              Abrí Microsoft Authenticator e ingresá el código de 6 dígitos
            </p>
            <label className="mt-6 block text-sm font-medium text-stone-700">
              Código
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                className={`${inputClass} text-center text-2xl tracking-[0.35em]`}
                placeholder="000000"
                required
                autoComplete="one-time-code"
                autoFocus
              />
            </label>
            {loginError && (
              <p className="mt-2 text-sm text-red-600">{loginError}</p>
            )}
            <button
              type="submit"
              className="mt-6 w-full rounded-full bg-stone-900 py-3 font-medium text-white hover:bg-[#8b6914]"
            >
              Verificar
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginStep("password");
                setTotpCode("");
                setLoginError("");
              }}
              className="mt-4 w-full text-center text-sm text-stone-500 hover:underline"
            >
              Volver a contraseña
            </button>
          </form>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-stone-800">Administración</h1>
          <p className="text-stone-500">Dashboard, ventas web y catálogo</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/"
            className="rounded-full border border-stone-300 px-4 py-2 text-sm"
          >
            Ver catálogo
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full bg-stone-200 px-4 py-2 text-sm"
          >
            Salir
          </button>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {(
          [
            ["dashboard", "Dashboard"],
            ["orders", "Ventas"],
            ["products", "Productos"],
            ["categories", "Categorías"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              tab === id
                ? "bg-[#4a3b30] text-white"
                : "bg-white text-[#6d5c4d] ring-1 ring-[#e4d5c5]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && (
        <AdminDashboard onGoOrders={() => setTab("orders")} />
      )}

      {tab === "orders" && <AdminOrders products={products} />}

      {tab === "categories" && (
        <form
          onSubmit={handleRenameCategory}
          className="rounded-2xl border border-[#e8ddd3] bg-white p-6 shadow-sm"
        >
          <h2 className="font-serif text-xl text-stone-800">Editar categoría</h2>
          <p className="mt-1 text-sm text-[#9a8b7e]">
            Renombra una categoría y se actualiza en todos los productos.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[#5c4a3d]">
              Categoría actual
              <select
                value={renameFrom}
                onChange={(e) => {
                  setRenameFrom(e.target.value);
                  if (!renameTo) setRenameTo(e.target.value);
                }}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="">Elegí una...</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-[#5c4a3d]">
              Nombre nuevo
              <input
                value={renameTo}
                onChange={(e) => setRenameTo(e.target.value)}
                placeholder="Nuevo nombre"
                className={inputClass}
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={renaming || !renameFrom || !renameTo.trim()}
            className="mt-4 rounded-full bg-[#5c4a3d] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#4a3b30] disabled:opacity-50"
          >
            {renaming ? "Renombrando..." : "Renombrar categoría"}
          </button>
          {message && (
            <p className="mt-3 text-sm text-green-700">{message}</p>
          )}
        </form>
      )}

      {tab === "products" && (
        <>
      <form
        onSubmit={handleSave}
        className="mb-10 rounded-2xl border border-[#e8ddd3] bg-white p-6 shadow-sm"
      >
        <h2 className="font-serif text-xl text-stone-800">
          {editingId ? "Editar producto" : "Nuevo producto"}
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-[#5c4a3d]">
            Nombre *
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              required
            />
          </label>
          <label className="block text-sm font-medium text-[#5c4a3d]">
            Precio (ARS) *
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className={inputClass}
              required
            />
          </label>
          <label className="block text-sm font-medium text-[#5c4a3d] sm:col-span-2">
            Descripción
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className={inputClass}
            />
          </label>

          <div className="block text-sm font-medium text-[#5c4a3d]">
            Categoría
            <select
              value={categoryMode === "custom" ? CUSTOM_CATEGORY : form.category}
              onChange={(e) => {
                if (e.target.value === CUSTOM_CATEGORY) {
                  setCategoryMode("custom");
                } else {
                  setCategoryMode("preset");
                  setForm({ ...form, category: e.target.value });
                }
              }}
              className={`${inputClass} cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 viewBox=%220 0 12 8%22%3E%3Cpath fill=%22%235c4a3d%22 d=%22M1 1l5 5 5-5%22/%3E%3C/svg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-10`}
            >
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value={CUSTOM_CATEGORY}>+ Nueva categoría...</option>
            </select>
            {categoryMode === "custom" && (
              <input
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Nombre de la nueva categoría"
                className={`${inputClass} mt-2`}
              />
            )}
          </div>

          <div className="block text-sm font-medium text-[#5c4a3d]">
            Imagen del producto
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-1.5 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#d4b896] bg-[#faf6f1] px-4 py-6 text-center transition hover:border-[#c9956a] hover:bg-[#f5ebe3] disabled:opacity-60"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5c4a3d] text-xl text-white">
                +
              </span>
              <span className="text-sm font-medium text-[#5c4a3d]">
                {uploading ? "Optimizando imagen..." : "Seleccionar imagen"}
              </span>
              <span className="text-xs text-[#9a8b7e]">
                JPG, PNG o WebP · hasta 15 MB
              </span>
              {selectedFileName && !uploading && (
                <span className="mt-1 truncate text-xs text-[#9a7349]">
                  {selectedFileName}
                </span>
              )}
            </button>
          </div>
        </div>

        {form.imageUrl && (
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div className="relative flex h-48 w-48 items-center justify-center overflow-hidden rounded-xl bg-[#f5ebe3] p-3 ring-1 ring-[#e8ddd3]">
              <Image
                src={form.imageUrl}
                alt="Preview"
                fill
                className="object-contain object-center p-2"
                unoptimized
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setForm((f) => ({ ...f, imageUrl: null }));
                setSelectedFileName("");
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Quitar imagen
            </button>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-6 text-sm">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="h-4 w-4 rounded border-[#d4b896] text-[#5c4a3d] focus:ring-[#c9956a]"
            />
            Destacado
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 rounded border-[#d4b896] text-[#5c4a3d] focus:ring-[#c9956a]"
            />
            Visible en catálogo
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#5c4a3d] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#9a7349] disabled:opacity-60"
          >
            {saving ? "Guardando..." : editingId ? "Actualizar producto" : "Crear producto"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-[#e8ddd3] px-6 py-2.5 text-sm text-[#5c4a3d]"
            >
              Cancelar edición
            </button>
          )}
        </div>
        {message && (
          <p
            className={`mt-3 text-sm ${message.includes("Error") || message.includes("Elegí") ? "text-red-600" : "text-green-700"}`}
          >
            {message}
          </p>
        )}
      </form>

      <section>
        <h2 className="mb-4 font-serif text-xl text-stone-800">
          Productos ({products.length})
        </h2>
        <div className="space-y-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-[#e8ddd3] bg-white p-4"
            >
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f5ebe3] p-1">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain object-center p-0.5"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-stone-400">
                    —
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-stone-800">
                  {product.name}
                  {!product.active && (
                    <span className="ml-2 text-xs text-red-500">(oculto)</span>
                  )}
                </p>
                <p className="text-sm text-stone-500">
                  {product.category} · {formatPrice(product.price)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(product)}
                  className="rounded-full border border-stone-300 px-3 py-1.5 text-sm"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => toggleActive(product)}
                  className="rounded-full border border-stone-300 px-3 py-1.5 text-sm"
                >
                  {product.active ? "Ocultar" : "Mostrar"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(product.id)}
                  className="rounded-full border border-red-200 px-3 py-1.5 text-sm text-red-600"
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
        </>
      )}
    </main>
  );
}
