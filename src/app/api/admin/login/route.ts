import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminPassword,
  createAdminSession,
  createPendingTotpSession,
} from "@/lib/auth";
import { isTotpEnabled } from "@/lib/totp";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!password || !verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  if (isTotpEnabled()) {
    await createPendingTotpSession();
    return NextResponse.json({ ok: true, requiresTotp: true });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
