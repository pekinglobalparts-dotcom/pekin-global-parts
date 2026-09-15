import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { marcarFacturasVencidas } from "@/lib/facturas";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Actualiza el estado de las facturas ya vencidas antes de listarlas.
  await marcarFacturasVencidas();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const where = status ? { status: status as never } : {};

  const [facturas, pendienteAgg] = await Promise.all([
    prisma.factura.findMany({
      where,
      include: {
        socio: { select: { razonSocial: true, ruc: true, emailCorporativo: true } },
        pedido: { select: { numero: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    // "Pendiente de cobro" = todo lo que aún no se ha pagado (pendientes + vencidas).
    prisma.factura.aggregate({
      _sum: { total: true },
      where: { status: { in: ["PENDIENTE", "VENCIDA"] } },
    }),
  ]);

  return NextResponse.json({
    facturas,
    totalPendiente: Number(pendienteAgg._sum.total || 0),
  });
}
