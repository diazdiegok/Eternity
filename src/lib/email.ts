import { Resend } from "resend";
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

export type SendMailResult =
  | { ok: true; skipped: false; provider: string }
  | { ok: false; skipped: boolean; error: string; provider?: string };

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
  const brand = SITE.emailBrand;
  const logoUrl = `${getBaseUrl()}/logo.png`;

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f7f1ea;font-family:Georgia,serif;color:#4a3b30;">
  <div style="max-width:560px;margin:24px auto;padding:28px;background:#fff;border-radius:20px;border:1px solid #e4d5c5;">
    <div style="text-align:center;margin:0 0 20px;">
      <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(brand)}" width="96" height="96" style="display:inline-block;width:96px;height:96px;border-radius:50%;object-fit:cover;border:1px solid #e4d5c5;" />
      <p style="margin:12px 0 0;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#a67c52;">${escapeHtml(brand)}</p>
    </div>
    <h1 style="margin:12px 0 0;font-size:26px;font-weight:normal;text-align:center;">${escapeHtml(title)}</h1>
    ${body}
    <p style="margin:28px 0 0;font-size:12px;color:#8a7b6e;text-align:center;">
      ${escapeHtml(brand)} · Joyas de leche materna
    </p>
  </div>
</body>
</html>`;
}

function parseFrom(raw?: string | null) {
  const value = (raw || "").trim();
  const match = value.match(/^(.*)<([^>]+)>$/);
  if (match) {
    return {
      name: match[1].trim().replace(/^"|"$/g, "") || SITE.emailBrand,
      email: match[2].trim(),
    };
  }
  if (value.includes("@")) {
    return { name: SITE.emailBrand, email: value };
  }
  return {
    name: SITE.emailBrand,
    email: process.env.SMTP_USER?.trim() || "onboarding@resend.dev",
  };
}

export function getEmailProvider(): "brevo" | "resend" | null {
  if (process.env.BREVO_API_KEY?.trim()) return "brevo";
  if (process.env.RESEND_API_KEY?.trim()) return "resend";
  return null;
}

export function isEmailConfigured() {
  return getEmailProvider() !== null;
}

async function sendViaBrevo(
  to: string,
  subject: string,
  html: string
): Promise<SendMailResult> {
  const apiKey = process.env.BREVO_API_KEY!.trim();
  const sender = parseFrom(
    process.env.EMAIL_FROM || process.env.SMTP_USER
  );

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: sender.name, email: sender.email },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      replyTo: { email: sender.email, name: sender.name },
    }),
  });

  const json = (await response.json().catch(() => ({}))) as {
    messageId?: string;
    message?: string;
  };

  if (!response.ok) {
    const message =
      json.message || `Brevo error HTTP ${response.status}`;
    console.error("Error Brevo:", message);
    return { ok: false, skipped: false, error: message, provider: "brevo" };
  }

  console.log(`Correo enviado a ${to} via Brevo: ${json.messageId || "ok"}`);
  return { ok: true, skipped: false, provider: "brevo" };
}

async function sendViaResend(
  to: string,
  subject: string,
  html: string
): Promise<SendMailResult> {
  const apiKey = process.env.RESEND_API_KEY!.trim();
  const from =
    process.env.EMAIL_FROM?.trim() ||
    `${SITE.emailBrand} <onboarding@resend.dev>`;
  const replyTo = process.env.SMTP_USER?.trim() || undefined;

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html,
    replyTo,
  });

  if (error) {
    console.error("Error Resend:", error.message);
    return {
      ok: false,
      skipped: false,
      error: error.message,
      provider: "resend",
    };
  }

  console.log(`Correo enviado a ${to} via Resend: ${data?.id || "ok"}`);
  return { ok: true, skipped: false, provider: "resend" };
}

async function sendMail(
  to: string,
  subject: string,
  html: string
): Promise<SendMailResult> {
  const provider = getEmailProvider();
  if (!provider) {
    return {
      ok: false,
      skipped: true,
      error:
        "Falta BREVO_API_KEY (recomendado, gratis con Gmail) o RESEND_API_KEY. Render Free bloquea Gmail SMTP.",
    };
  }

  try {
    if (provider === "brevo") return await sendViaBrevo(to, subject, html);
    return await sendViaResend(to, subject, html);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al enviar correo";
    console.error(`Error ${provider}:`, message);
    return { ok: false, skipped: false, error: message, provider };
  }
}

export async function sendOrderReceivedEmail(
  to: string,
  order: OrderMailBase & { customerName?: string | null; customerPhone?: string | null }
) {
  const greeting = order.customerName?.trim()
    ? `Hola ${escapeHtml(order.customerName.trim())},`
    : "Hola,";

  const body = `
    <p style="margin:16px 0;line-height:1.6;color:#6d5c4d;font-size:15px;">
      ${greeting}
    </p>
    <p style="margin:16px 0;line-height:1.5;color:#6d5c4d;">
      ¡Gracias por tu compra! Recibimos tu pedido y ya se encuentra <strong>en curso</strong>.
    </p>
    <p style="margin:0;font-size:14px;color:#8a7b6e;">N° de orden</p>
    <p style="margin:4px 0 16px;font-size:28px;letter-spacing:0.04em;">${escapeHtml(order.code)}</p>
    <p style="margin:0 0 16px;font-size:14px;color:#6d5c4d;">Fecha: ${escapeHtml(formatDate(order.createdAt))}</p>
    ${
      order.customerPhone
        ? `<p style="margin:0 0 16px;font-size:14px;color:#6d5c4d;">Te vamos a contactar al <strong>${escapeHtml(order.customerPhone)}</strong> por WhatsApp para coordinar.</p>`
        : ""
    }
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
    <p style="margin:18px 0 0;font-size:14px;color:#8a7b6e;font-style:italic;">
      Con cariño,<br />El equipo de ${escapeHtml(SITE.emailBrand)}
    </p>
  `;

  return sendMail(
    to,
    `Pedido ${order.code} recibido — ${SITE.emailBrand}`,
    wrapEmail("Pedido registrado", body)
  );
}

function thankYouClosing() {
  return `
    <p style="margin:24px 0 0;line-height:1.6;color:#6d5c4d;font-size:15px;">
      Desde el corazón de <strong>${escapeHtml(SITE.emailBrand)}</strong>, queremos agradecerte
      por confiar en nosotros para acompañar este momento tan especial. Cada pieza está hecha
      con dedicación, cariño y respeto por tu historia.
    </p>
    <p style="margin:14px 0 0;line-height:1.6;color:#6d5c4d;font-size:15px;">
      Gracias por elegirnos. Esperamos que tu recuerdo Eternity te acompañe siempre.
    </p>
    <p style="margin:18px 0 0;font-size:14px;color:#8a7b6e;font-style:italic;">
      Con cariño,<br />El equipo de ${escapeHtml(SITE.emailBrand)}
    </p>
  `;
}

export async function sendOrderCompletedEmail(
  to: string,
  order: OrderMailBase & {
    shippingCarrier: string;
    trackingCode?: string | null;
    personalDelivery?: boolean;
  }
) {
  if (order.personalDelivery) {
    const body = `
      <p style="margin:16px 0;line-height:1.6;color:#6d5c4d;font-size:15px;">
        ¡Qué alegría compartirte que tu pedido <strong>${escapeHtml(order.code)}</strong>
        ya está <strong>listo para entrega personal</strong>!
      </p>
      <p style="margin:0 0 16px;line-height:1.6;color:#6d5c4d;font-size:15px;">
        Coordinamos contigo el encuentro para que recibas tu pieza de forma cercana y especial.
      </p>
      <p style="margin:0 0 16px;font-size:14px;color:#6d5c4d;">Fecha del pedido: ${escapeHtml(formatDate(order.createdAt))}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#4a3b30;">
        ${itemsHtml(order.items)}
      </table>
      <p style="margin:16px 0 0;font-size:18px;"><strong>Total: ${formatPrice(order.total)}</strong></p>
      ${thankYouClosing()}
    `;

    return sendMail(
      to,
      `Tu pedido ${order.code} está listo — ${SITE.emailBrand}`,
      wrapEmail("Listo para entrega personal", body)
    );
  }

  const tracking = (order.trackingCode || "").trim();
  const body = `
    <p style="margin:16px 0;line-height:1.6;color:#6d5c4d;font-size:15px;">
      ¡Buenas noticias! Tu pedido <strong>${escapeHtml(order.code)}</strong> ya se encuentra
      <strong>en camino</strong>.
    </p>
    <p style="margin:0;font-size:14px;color:#8a7b6e;">Empresa de envío</p>
    <p style="margin:4px 0 12px;font-size:18px;">${escapeHtml(order.shippingCarrier)}</p>
    ${
      tracking
        ? `<p style="margin:0;font-size:14px;color:#8a7b6e;">N° / código de seguimiento</p>
           <p style="margin:4px 0 16px;font-size:22px;letter-spacing:0.04em;">${escapeHtml(tracking)}</p>`
        : ""
    }
    <p style="margin:0 0 16px;font-size:14px;color:#6d5c4d;">Fecha del pedido: ${escapeHtml(formatDate(order.createdAt))}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;color:#4a3b30;">
      ${itemsHtml(order.items)}
    </table>
    <p style="margin:16px 0 0;font-size:18px;"><strong>Total: ${formatPrice(order.total)}</strong></p>
    ${thankYouClosing()}
  `;

  return sendMail(
    to,
    `Tu pedido ${order.code} está en envío — ${SITE.emailBrand}`,
    wrapEmail("Pedido en envío", body)
  );
}

/** @deprecated Prefer sendOrderCompletedEmail */
export async function sendOrderShippedEmail(
  to: string,
  order: OrderMailBase & {
    shippingCarrier: string;
    trackingCode: string;
  }
) {
  return sendOrderCompletedEmail(to, order);
}

export function normalizeEmail(value: string) {
  return String(value || "").trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}
