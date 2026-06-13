import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendPedidoEnviado } from "@/lib/email";

const updateSchema = z.object({
  status: z.enum(["PENDIENTE", "CONFIRMADO", "EN_PROCESO", "ENVIADO", "ENTREGADO", "CANCELADO"]),
  notas: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const pedido = await prisma.pedido.update({
    where: { id },
    data: parsed.data,
    include: {
      socio: { select: { emailCorporativo: true, razonSocial: true } },
    },
  });

  if (parsed.data.status === "ENVIADO") {
    await prisma.notificacion.create({
      data: {
        socioId: pedido.socioId,
        tipo: "PEDIDO_ENVIADO",
        titulo: "Pedido enviado",
        mensaje: `Su pedido ${pedido.numero} está en camino.`,
        url: "/socio/pedidos",
      },
    });
    try {
      await sendPedidoEnviado(
        pedido.socio.emailCorporativo,
        pedido.socio.razonSocial,
        pedido.numero
      );
    } catch (e) {
      console.error("Email error:", e);
    }
  }

  return NextResponse.json(pedido);
}
