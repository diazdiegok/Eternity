import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  isEmailConfigured,
  isValidEmail,
  normalizeEmail,
  sendTestEmail,
} from "@/lib/email";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  return NextResponse.json({
    configured: isEmailConfigured(),
    provider: "resend",
    from: process.env.EMAIL_FROM?.trim() || null,
    replyTo: process.env.SMTP_USER?.trim() || null,
    note: isEmailConfigured()
      ? "Resend listo (HTTPS). Render Free bloquea Gmail SMTP."
      : "Falta RESEND_API_KEY en Render.",
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

  return NextResponse.json({ ok: true, to });
}
