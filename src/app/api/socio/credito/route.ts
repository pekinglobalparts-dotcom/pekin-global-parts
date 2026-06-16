import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "socio") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [socio, movimientos] = await Promise.all([
    prisma.socio.findUnique({
      where: { id: session.user.id },
      select: { lineaCredito: true, creditoUtilizado: true },
    }),
    prisma.movimientoCredito.findMany({
      where: { socioId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const socioWithExtra = socio ? {
    ...socio,
    tipoPago: (socio as unknown as { tipoPago?: string }).tipoPago ?? "CREDITO",
    plazoCredito: (socio as unknown as { plazoCredito?: number }).plazoCredito ?? 30,
  } : null;
  return NextResponse.json({ socio: socioWithExtra, movimientos });
}
