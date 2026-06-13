import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "socio") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const facturas = await prisma.factura.findMany({
    where: { socioId: session.user.id },
    include: {
      pedido: { select: { numero: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(facturas);
}
