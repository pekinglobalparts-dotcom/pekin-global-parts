import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Editar la fecha real de un pedido — solo Super Admin (el dueño).
// La fecha afecta el conteo de días de cobro, por eso está restringida.
const schema = z.object({ fecha: z.string().min(1) });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin" || session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  // Mediodía UTC para que la fecha no se corra un día por la zona horaria de Perú.
  const d = new Date(`${parsed.data.fecha}T12:00:00.000Z`);
  if (isNaN(d.getTime())) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
  }

  const pedido = await prisma.pedido.update({
    where: { id },
    data: { createdAt: d },
    select: { id: true, createdAt: true },
  });

  return NextResponse.json({ ok: true, pedido });
}
