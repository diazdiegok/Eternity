import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSession,
  clearPendingTotpSession,
  hasPendingTotpSession,
} from "@/lib/auth";
import { isTotpEnabled, verifyTotpCode } from "@/lib/totp";

export async function POST(request: NextRequest) {
  if (!isTotpEnabled()) {
    return NextResponse.json({ error: "2FA no configurado" }, { status: 400 });
  }

  const pending = await hasPendingTotpSession();
  if (!pending) {
    return NextResponse.json(
      { error: "Sesión expirada. Volvé a ingresar la contraseña." },
      { status: 401 }
    );
  }

  const { code } = await request.json();
  if (!code || !(await verifyTotpCode(String(code)))) {
    return NextResponse.json({ error: "Código incorrecto" }, { status: 401 });
  }

  await clearPendingTotpSession();
  await createAdminSession();
  return NextResponse.json({ ok: true });
}
