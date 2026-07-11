import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { isEmailConfigured } from "@/lib/email";

/** Estado rápido de SMTP para el admin (sin revelar la clave). */
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  return NextResponse.json({
    configured: isEmailConfigured(),
    user: process.env.SMTP_USER?.trim() || null,
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
  });
}
