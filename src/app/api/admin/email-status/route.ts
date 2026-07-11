import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  getEmailProvider,
  isEmailConfigured,
  isValidEmail,
  normalizeEmail,
  sendTestEmail,
} from "@/lib/email";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const provider = getEmailProvider();
  const from =
    process.env.EMAIL_FROM?.trim() ||
    process.env.SMTP_USER?.trim() ||
    null;

  return NextResponse.json({
    configured: isEmailConfigured(),
    provider,
    from,
    note:
      provider === "brevo"
        ? "Brevo listo (gratis). Podés enviar a cualquier cliente desde tu Gmail verificado."
        : provider === "resend"
          ? "Resend listo. Sin dominio propio solo llega a tu mail de Resend."
          : "Configurá BREVO_API_KEY (gratis con Gmail). Render Free bloquea Gmail SMTP.",
  });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const to = normalizeEmail(String(body.to || ""));

  if (!isValidEmail(to)) {
    return NextResponse.json(
      { error: "Indicá un correo válido de destino" },
      { status: 400 }
    );
  }

  const result = await sendTestEmail(to);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, to, provider: result.provider });
}
