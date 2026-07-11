import { NextRequest, NextResponse } from "next/server";
import { findActiveCoupon } from "@/lib/coupons";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const code = String(body.code || "");

  const coupon = await findActiveCoupon(code);
  if (!coupon) {
    return NextResponse.json(
      { error: "Cupón inválido o inactivo" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    code: coupon.code,
    percentOff: coupon.percentOff,
  });
}
