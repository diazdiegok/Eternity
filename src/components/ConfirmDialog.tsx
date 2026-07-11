"use client";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  danger = true,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-[#4a3b30]/40 backdrop-blur-[2px]"
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        className="relative w-full max-w-sm rounded-3xl border border-[#e4d5c5] bg-[#f7f1ea] p-6 shadow-2xl"
      >
        <h3
          id="confirm-title"
          className="font-serif text-2xl text-[#4a3b30]"
        >
          {title}
        </h3>
        <p id="confirm-desc" className="mt-2 text-sm leading-relaxed text-[#6d5c4d]">
          {message}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-full border border-[#e4d5c5] bg-white px-4 py-2.5 text-sm text-[#5c4a3d] transition hover:bg-[#efe4d8] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-full px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-50 ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#4a3b30] hover:bg-[#5c4a3d]"
            }`}
          >
            {busy ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function NoticeDialog({
  open,
  title = "Aviso",
  message,
  onClose,
}: {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-[#4a3b30]/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative w-full max-w-sm rounded-3xl border border-[#e4d5c5] bg-[#f7f1ea] p-6 shadow-2xl"
      >
        <h3 className="font-serif text-2xl text-[#4a3b30]">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#6d5c4d]">{message}</p>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#4a3b30] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5c4a3d]"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
