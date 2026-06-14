import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    prisma.factura.aggregate({
      _sum: { total: true },
      where: { status: "PENDIENTE" },
    }),
  ]);

  return NextResponse.json({
    facturas,
    totalPendiente: Number(pendienteAgg._sum.total || 0),
  });
}
