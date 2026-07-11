import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(coupons);
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const code = String(body.code || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
  const percentOff = Number(body.percentOff);

  if (!code || code.length < 2) {
    return NextResponse.json({ error: "Código inválido" }, { status: 400 });
  }
  if (!Number.isFinite(percentOff) || percentOff <= 0 || percentOff > 100) {
    return NextResponse.json(
      { error: "El descuento debe ser entre 1 y 100%" },
      { status: 400 }
    );
  }

  try {
    const coupon = await db.coupon.create({
      data: {
        code,
        percentOff,
        active: body.active !== false,
      },
    });
    return NextResponse.json(coupon);
  } catch {
    return NextResponse.json(
      { error: "Ese código ya existe" },
      { status: 409 }
    );
  }
}
