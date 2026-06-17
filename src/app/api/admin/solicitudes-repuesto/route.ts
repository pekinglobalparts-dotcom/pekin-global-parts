import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const solicitudes = await (prisma as unknown as {
    solicitudRepuesto: {
      findMany: (args: unknown) => Promise<unknown[]>;
    };
  }).solicitudRepuesto.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      socio: { select: { razonSocial: true, ruc: true, emailCorporativo: true } },
      pedido: { select: { status: true, numero: true, total: true } },
    },
  });

  return NextResponse.json({ solicitudes });
}
