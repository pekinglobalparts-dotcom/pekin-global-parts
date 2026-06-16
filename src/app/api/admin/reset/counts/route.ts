import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [socios, solicitudes, pedidos, facturas, cotizaciones, notificaciones, movimientosCredito] =
    await Promise.all([
      prisma.socio.count(),
      prisma.solicitud.count(),
      prisma.pedido.count(),
      prisma.factura.count(),
      prisma.cotizacion.count(),
      prisma.notificacion.count(),
      prisma.movimientoCredito.count(),
    ]);

  return NextResponse.json({ socios, solicitudes, pedidos, facturas, cotizaciones, notificaciones, movimientosCredito });
}
