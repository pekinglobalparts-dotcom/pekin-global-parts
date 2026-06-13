import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (session?.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const movimientos = await prisma.movimientoCredito.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      socio: { select: { razonSocial: true } },
    },
  });

  return NextResponse.json({ movimientos });
}
