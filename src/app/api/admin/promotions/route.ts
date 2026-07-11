import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const promotions = await db.promotion.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(promotions);
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const categories = Array.isArray(body.categories)
    ? body.categories.map((c: string) => String(c).trim()).filter(Boolean)
    : [];
  const percentOff = Number(body.percentOff);
  const hours = Math.max(1, Math.floor(Number(body.hours) || 0));
  const name = String(body.name || "").trim();

  if (!categories.length) {
    return NextResponse.json(
      { error: "Elegí al menos una categoría" },
      { status: 400 }
    );
  }
  if (!Number.isFinite(percentOff) || percentOff <= 0 || percentOff > 100) {
    return NextResponse.json(
      { error: "El descuento debe ser entre 1 y 100%" },
      { status: 400 }
    );
  }
  if (!hours) {
    return NextResponse.json(
      { error: "Indicá la cantidad de horas" },
      { status: 400 }
    );
  }

  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + hours * 60 * 60 * 1000);

  const promotion = await db.promotion.create({
    data: {
      name: name || `Promo −${percentOff}%`,
      categories,
      percentOff,
      hours,
      startsAt,
      endsAt,
      active: true,
    },
  });

  return NextResponse.json(promotion, { status: 201 });
}
