import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, price, imageUrl, category, featured, active } = body;

  if (!name || price == null) {
    return NextResponse.json({ error: "Nombre y precio son obligatorios" }, { status: 400 });
  }

  const product = await db.product.create({
    data: {
      name: String(name).trim(),
      description: String(description || "").trim(),
      price: Number(price),
      imageUrl: imageUrl || null,
      category: String(category || "General").trim(),
      featured: Boolean(featured),
      active: active !== false,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
