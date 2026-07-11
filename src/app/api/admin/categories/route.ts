import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const from = String(body.from || "").trim();
  const to = String(body.to || "").trim();

  if (!from || !to) {
    return NextResponse.json(
      { error: "Indicá el nombre actual y el nuevo" },
      { status: 400 }
    );
  }

  if (from === to) {
    return NextResponse.json({ ok: true, updated: 0 });
  }

  const result = await db.product.updateMany({
    where: { category: from },
    data: { category: to },
  });

  return NextResponse.json({ ok: true, updated: result.count, from, to });
}
