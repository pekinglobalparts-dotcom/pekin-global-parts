import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFicha360 } from "@/lib/crm";

// Ficha 360 de un cliente: historial, qué compra/cotiza más, conversión,
// salud de facturas y próxima compra estimada.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const ficha = await getFicha360(id);
  if (!ficha) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  return NextResponse.json({ ficha });
}
