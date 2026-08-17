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
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = status ? { status: status as never } : {};

  const [pedidos, total] = await Promise.all([
    prisma.pedido.findMany({
      where,
      include: {
        socio: { select: { razonSocial: true, ruc: true, emailCorporativo: true } },
        items: {
          include: { producto: { select: { nombre: true, codigo: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.pedido.count({ where }),
  ]);

  // El costo (y por ende la ganancia) es información privada del dueño.
  // Un ADMIN normal no debe verlo: se elimina de la respuesta.
  const esSuperAdmin = session.user.adminRole === "SUPER_ADMIN";
  const pedidosSalida = esSuperAdmin
    ? pedidos
    : pedidos.map(p => ({
        ...p,
        items: (p.items as Array<Record<string, unknown>>).map(({ costoUnit, ...resto }) => { void costoUnit; return resto; }),
      }));

  return NextResponse.json({ pedidos: pedidosSalida, total, esSuperAdmin });
}
