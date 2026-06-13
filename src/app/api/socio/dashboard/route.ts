import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "socio") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const socioId = session.user.id;

  const [socio, pedidosActivos, facturasPendientes, cotizacionesPendientes, notificaciones] =
    await Promise.all([
      prisma.socio.findUnique({ where: { id: socioId } }),
      prisma.pedido.count({
        where: {
          socioId,
          status: { in: ["PENDIENTE", "CONFIRMADO", "EN_PROCESO", "ENVIADO"] },
        },
      }),
      prisma.factura.count({ where: { socioId, status: "PENDIENTE" } }),
      prisma.cotizacion.count({ where: { socioId, status: "PENDIENTE" } }),
      prisma.notificacion.findMany({
        where: { socioId, leida: false },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  if (!socio) {
    return NextResponse.json({ error: "Socio no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    socio: {
      id: socio.id,
      razonSocial: socio.razonSocial,
      ruc: socio.ruc,
      sector: socio.sector,
      lineaCredito: socio.lineaCredito,
      creditoUtilizado: socio.creditoUtilizado,
      creditoDisponible:
        Number(socio.lineaCredito) - Number(socio.creditoUtilizado),
    },
    pedidosActivos,
    facturasPendientes,
    cotizacionesPendientes,
    notificaciones,
  });
}
