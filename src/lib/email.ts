import nodemailer from "nodemailer";
import { SITE, getBaseUrl } from "@/lib/config";
import { formatPrice } from "@/lib/whatsapp";

type OrderMailItem = {
  name: string;
  price: number;
  quantity: number;
};

type OrderMailBase = {
  code: string;
  createdAt: Date | string;
  total: number;
  customerNote?: string | null;
  couponCode?: string | null;
  discountAmount?: number | null;
  items: OrderMailItem[];
};

function formatDate(value: Date | string) {
  return new Date(value).toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    dateStyle: "long",
    timeStyle: "short",
  });
}

function itemsHtml(items: OrderMailItem[]) {
  return items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #efe4d8;">${item.quantity}× ${escapeHtml(item.name)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #efe4d8;text-align:right;">${formatPrice(item.price * item.quantity)}</td>
        </tr>`
    )
    .join("");
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapEmail(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f7f1ea;font-family:Georgia,serif;color:#4a3b30;">
  <div style="max-width:560px;margin:24px auto;padding:28px;background:#fff;border-radius:20px;border:1px solid #e4d5c5;">
    <p style="margin:0;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#a67c52;">${escapeHtml(SITE.brandFull)}</p>
    <h1 style="margin:12px 0 0;font-size:26px;font-weight:normal;">${escapeHtml(title)}</h1>
    ${body}
    <p style="margin:28px 0 0;font-size:12px;color:#8a7b6e;">
      Si tenés dudas, escribinos por WhatsApp o Instagram.
    </p>
  </div>
</body>
</html>`;
}

export function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim()
  );
}

function smtpCredentials() {
  const user = process.env.SMTP_USER?.trim() || "";
  // Gmail muestra la app password con espacios; hay que quitarlos
  const pass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
  return { user, pass };
}

function createTransport() {
  const { user, pass } = smtpCredentials();
  if (!user || !pass) {
    throw new Error("SMTP no configurado");
  }

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    requireTLS: port === 587,
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 12_000,
    auth: { user, pass },
  });
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} agotó el tiempo (${ms}ms)`)),
          ms
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function sendMail(to: string, subject: string, html: string) {
  if (!isEmailConfigured()) {
    console.warn(
      "SMTP no configurado (faltan SMTP_USER / SMTP_PASS): se omite envío"
    );
    return { ok: false as const, skipped: true as const, error: "SMTP no configurado" };
  }

  const { user } = smtpCredentials();
  const from =
    process.env.EMAIL_FROM?.trim() ||
    `${SITE.brandFull} <${user}>`;

  try {
    const transport = createTransport();
    const info = await withTimeout(
      transport.sendMail({ from, to, subject, html }),
      12_000,
      "Envío SMTP"
    );
    console.log(`Correo enviado a ${to}: ${info.messageId}`);
    try {
      transport.close();
    } catch {
      // ignore
    }
    return { ok: true as const, skipped: false as const };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al enviar correo";
    console.error("Error SMTP:", message);
    return { ok: false as const, skipped: false as const, error: message };
  }
}

export async function sendOrderReceivedEmail(
  to: string,
  order: OrderMailBase
) {
  const body = `
    <p style="margin:16px 0;line-height:1.5;color:#6d5c4d;">
      Recibimos tu pedido. Se encuentra <strong>en curso</strong>.
    </p>
    <p style="margin:0;font-size:14px;color:#8a7b6e;">N° de orden</p>
    <p style="margin:4px 0 16px;font-size:28px;letter-spacing:0.04em;">${escapeHtml(order.code)}</p>
    <p style="margin:0 0 16px;font-size:14px;color:#6d5c4d;">Fecha: ${escapeHtml(formatDate(order.createdAt))}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;color:#4a3b30;">
      ${itemsHtml(order.items)}
    </table>
    ${
      order.discountAmount && order.discountAmount > 0
        ? `<p style="margin:12px 0 0;font-size:14px;color:#a67c52;">Descuento${order.couponCode ? ` (${escapeHtml(order.couponCode)})` : ""}: −${formatPrice(order.discountAmount)}</p>`
        : ""
    }
    <p style="margin:16px 0 0;font-size:18px;"><strong>Total: ${formatPrice(order.total)}</strong></p>
    ${
      order.customerNote
        ? `<p style="margin:16px 0 0;padding:12px;background:#f7f1ea;border-radius:12px;font-size:14px;color:#6d5c4d;">Nota: ${escapeHtml(order.customerNote)}</p>`
        : ""
    }
    <p style="margin:20px 0 0;font-size:14px;color:#6d5c4d;">
      Podés consultar el estado en ${escapeHtml(getBaseUrl())}/mi-pedido con el N° de orden y este correo.
    </p>
  `;

  return sendMail(
    to,
    `Pedido ${order.code} recibido — ${SITE.brandFull}`,
    wrapEmail("Pedido registrado", body)
  );
}

export async function sendOrderShippedEmail(
  to: string,
  order: OrderMailBase & {
    shippingCarrier: string;
    trackingCode: string;
  }
) {
  const body = `
    <p style="margin:16px 0;line-height:1.5;color:#6d5c4d;">
      ¡Buenas noticias! Tu pedido <strong>${escapeHtml(order.code)}</strong> ya se encuentra
      <strong>en envío</strong>.
    </p>
    <p style="margin:0;font-size:14px;color:#8a7b6e;">Empresa de envío</p>
    <p style="margin:4px 0 12px;font-size:18px;">${escapeHtml(order.shippingCarrier)}</p>
    <p style="margin:0;font-size:14px;color:#8a7b6e;">N° / código de seguimiento</p>
    <p style="margin:4px 0 16px;font-size:22px;letter-spacing:0.04em;">${escapeHtml(order.trackingCode)}</p>
    <p style="margin:0 0 16px;font-size:14px;color:#6d5c4d;">Fecha del pedido: ${escapeHtml(formatDate(order.createdAt))}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;color:#4a3b30;">
      ${itemsHtml(order.items)}
    </table>
    <p style="margin:16px 0 0;font-size:18px;"><strong>Total: ${formatPrice(order.total)}</strong></p>
  `;

  return sendMail(
    to,
    `Tu pedido ${order.code} está en envío — ${SITE.brandFull}`,
    wrapEmail("Pedido en envío", body)
  );
}

export function normalizeEmail(value: string) {
  return String(value || "").trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}
