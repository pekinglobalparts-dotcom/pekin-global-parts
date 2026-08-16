import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Registrar/actualizar el costo (lo que te costó el repuesto) por línea de un
// pedido ya existente. Solo admin. El socio nunca ve el costo.
const schema = z.object({
  costos: z.array(z.object({
    itemId: z.string().min(1),
    costoUnit: z.coerce.number().min(0).nullable(),
  })).min(1),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  // Solo permite actualizar ítems que pertenezcan a este pedido.
  const itemsDelPedido = await prisma.pedidoItem.findMany({
    where: { pedidoId: id },
    select: { id: true },
  });
  const idsValidos = new Set(itemsDelPedido.map(i => i.id));

  await prisma.$transaction(
    parsed.data.costos
      .filter(c => idsValidos.has(c.itemId))
      .map(c => prisma.pedidoItem.update({
        where: { id: c.itemId },
        data: { costoUnit: c.costoUnit },
      }))
  );

  return NextResponse.json({ ok: true });
}
