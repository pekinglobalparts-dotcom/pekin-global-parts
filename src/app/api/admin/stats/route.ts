import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    totalSocios,
    solicitudesPendientes,
    totalProductos,
    cotizacionesPendientes,
    pedidosActivos,
    facturasPendientes,
  ] = await Promise.all([
    prisma.socio.count({ where: { status: "ACTIVO" } }),
    prisma.solicitud.count({ where: { status: "PENDIENTE" } }),
    prisma.producto.count({ where: { activo: true } }),
    prisma.cotizacion.count({ where: { status: "PENDIENTE" } }),
    prisma.pedido.count({
      where: { status: { in: ["PENDIENTE", "CONFIRMADO", "EN_PROCESO"] } },
    }),
    prisma.factura.count({ where: { status: "PENDIENTE" } }),
  ]);

  return NextResponse.json({
    totalSocios,
    solicitudesPendientes,
    totalProductos,
    cotizacionesPendientes,
    pedidosActivos,
    facturasPendientes,
  });
}
