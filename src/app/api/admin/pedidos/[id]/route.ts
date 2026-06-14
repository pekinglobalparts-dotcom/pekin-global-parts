import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendPedidoConfirmado, sendPedidoEnviado, sendPedidoEntregado } from "@/lib/email";
import { generateNumero } from "@/lib/utils";
import { sendFacturaEmitida } from "@/lib/email";

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

  const { status } = parsed.data;
  const { emailCorporativo: email, razonSocial } = pedido.socio;

  // Notifications + emails by status
  if (status === "CONFIRMADO") {
    await prisma.notificacion.create({
      data: {
        socioId: pedido.socioId,
        tipo: "PEDIDO_CONFIRMADO",
        titulo: "Pedido confirmado",
        mensaje: `Su pedido ${pedido.numero} fue confirmado y está en preparación.`,
        url: "/socio/pedidos",
      },
    });
    sendPedidoConfirmado(email, razonSocial, pedido.numero, Number(pedido.total)).catch(console.error);
  }

  if (status === "ENVIADO") {
    await prisma.notificacion.create({
      data: {
        socioId: pedido.socioId,
        tipo: "PEDIDO_ENVIADO",
        titulo: "Pedido enviado",
        mensaje: `Su pedido ${pedido.numero} está en camino.`,
        url: "/socio/pedidos",
      },
    });
    sendPedidoEnviado(email, razonSocial, pedido.numero, pedido.direccionEntrega).catch(console.error);
  }

  if (status === "ENTREGADO") {
    await prisma.notificacion.create({
      data: {
        socioId: pedido.socioId,
        tipo: "PEDIDO_ENVIADO",
        titulo: "Pedido entregado",
        mensaje: `Su pedido ${pedido.numero} fue entregado exitosamente.`,
        url: "/socio/pedidos",
      },
    });
    sendPedidoEntregado(email, razonSocial, pedido.numero).catch(console.error);

    // Auto-create factura if not exists
    const facturaExistente = await prisma.factura.findUnique({ where: { pedidoId: id } });
    if (!facturaExistente) {
      const vencimiento = new Date();
      vencimiento.setDate(vencimiento.getDate() + 30);

      const factura = await prisma.factura.create({
        data: {
          numero: generateNumero("FAC", Date.now().toString()),
          socioId: pedido.socioId,
          pedidoId: id,
          subtotal: pedido.subtotal,
          igv: pedido.igv,
          total: pedido.total,
          fechaVencimiento: vencimiento,
        },
      });

      await prisma.notificacion.create({
        data: {
          socioId: pedido.socioId,
          tipo: "FACTURA_EMITIDA",
          titulo: "Nueva factura emitida",
          mensaje: `Se emitió la factura ${factura.numero} por S/ ${Number(pedido.total).toFixed(2)}.`,
          url: "/socio/facturas",
        },
      });

      const vencimientoStr = vencimiento.toLocaleDateString("es-PE");
      sendFacturaEmitida(email, razonSocial, factura.numero, Number(pedido.total), vencimientoStr).catch(console.error);
    }
  }

  return NextResponse.json(pedido);
}
