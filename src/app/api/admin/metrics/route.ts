import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Socios por sector
  const sociosPorSector = await prisma.socio.groupBy({
    by: ["sector"],
    _count: { sector: true },
    where: { status: "ACTIVO" },
  });

  // Solicitudes por status
  const solicitudesPorStatus = await prisma.solicitud.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  // Pedidos por status
  const pedidosPorStatus = await prisma.pedido.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  // Últimos 6 meses: nuevos socios
  const now = new Date();
  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { mes: d.toLocaleString("es-PE", { month: "short" }), inicio: d };
  });

  const sociosPorMes = await Promise.all(
    meses.map(async ({ mes, inicio }) => {
      const fin = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 1);
      const count = await prisma.socio.count({
        where: { createdAt: { gte: inicio, lt: fin } },
      });
      return { mes, socios: count };
    })
  );

  // Top 5 productos más cotizados
  const topProductos = await prisma.cotizacionItem.groupBy({
    by: ["productoId"],
    _count: { productoId: true },
    orderBy: { _count: { productoId: "desc" } },
    take: 5,
  });

  const topProductosConNombre = await Promise.all(
    topProductos.map(async (p) => {
      const prod = await prisma.producto.findUnique({
        where: { id: p.productoId },
        select: { nombre: true, codigo: true },
      });
      return { nombre: prod?.nombre || "Desconocido", count: p._count.productoId };
    })
  );

  // Totales financieros
  const totalFacturado = await prisma.factura.aggregate({
    _sum: { total: true },
    where: { status: { in: ["PENDIENTE", "PAGADA"] } },
  });

  const totalPendienteCobro = await prisma.factura.aggregate({
    _sum: { total: true },
    where: { status: "PENDIENTE" },
  });

  return NextResponse.json({
    sociosPorSector: sociosPorSector.map(s => ({
      sector: s.sector.replace(/_/g, " "),
      count: s._count.sector,
    })),
    solicitudesPorStatus: solicitudesPorStatus.map(s => ({
      status: s.status,
      count: s._count.status,
    })),
    pedidosPorStatus: pedidosPorStatus.map(p => ({
      status: p.status,
      count: p._count.status,
    })),
    sociosPorMes,
    topProductos: topProductosConNombre,
    totalFacturado: Number(totalFacturado._sum.total || 0),
    totalPendienteCobro: Number(totalPendienteCobro._sum.total || 0),
  });
}
