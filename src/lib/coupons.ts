import { db } from "@/lib/db";

export async function findActiveCoupon(code: string) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  const coupon = await db.coupon.findUnique({ where: { code: normalized } });
  if (!coupon || !coupon.active) return null;
  if (coupon.percentOff <= 0 || coupon.percentOff > 100) return null;
  return coupon;
}
