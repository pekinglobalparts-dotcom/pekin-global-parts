import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "socio") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [notificaciones, unreadCount] = await Promise.all([
    prisma.notificacion.findMany({
      where: { socioId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notificacion.count({
      where: { socioId: session.user.id, leida: false },
    }),
  ]);

  return NextResponse.json({ notificaciones, unreadCount });
}

export async function PATCH() {
  const session = await auth();
  if (!session || session.user.role !== "socio") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.notificacion.updateMany({
    where: { socioId: session.user.id, leida: false },
    data: { leida: true },
  });

  return NextResponse.json({ ok: true });
}
