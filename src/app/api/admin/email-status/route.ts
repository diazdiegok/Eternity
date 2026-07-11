import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getEmailProvider, isEmailConfigured } from "@/lib/email";

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
  });
}
