import { verify } from "otplib";

export function isTotpEnabled(): boolean {
  return Boolean(process.env.ADMIN_TOTP_SECRET?.trim());
}

export async function verifyTotpCode(code: string): Promise<boolean> {
  const secret = process.env.ADMIN_TOTP_SECRET?.trim();
  if (!secret) return false;

  const token = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(token)) return false;

  const result = await verify({
    secret,
    token,
    epochTolerance: 30,
  });

  return result.valid;
}
