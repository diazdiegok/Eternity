import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "eternity_admin_session";
const PENDING_COOKIE_NAME = "eternity_admin_pending";
const SESSION_HOURS = 12;
const PENDING_MINUTES = 5;

function getSecret() {
  const secret = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "cambiar-en-produccion";
  return new TextEncoder().encode(secret);
}

export async function createAdminSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  cookieStore.delete(PENDING_COOKIE_NAME);
}

export async function createPendingTotpSession() {
  const token = await new SignJWT({ pendingTotp: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${PENDING_MINUTES}m`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(PENDING_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PENDING_MINUTES * 60,
  });
}

export async function hasPendingTotpSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PENDING_COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.pendingTotp === true;
  } catch {
    return false;
  }
}

export async function clearPendingTotpSession() {
  const cookieStore = await cookies();
  cookieStore.delete(PENDING_COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "admin123";
  return password === expected;
}
