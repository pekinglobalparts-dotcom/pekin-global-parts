import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "socio") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pedidos = await prisma.pedido.findMany({
    where: { socioId: session.user.id },
    include: {
      items: {
        include: { producto: { select: { nombre: true, codigo: true, imagenUrl: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(pedidos);
}
