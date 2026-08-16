import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateNumero } from "@/lib/utils";

const itemSchema = z.object({
  descripcion: z.string().min(1),
  cantidad: z.coerce.number().int().min(1),
  precioUnit: z.coerce.number().min(0),
  costoUnit: z.coerce.number().min(0).optional(),
});

const createSchema = z.object({
  socioId: z.string().min(1),
  solicitudRepuestoId: z.string().optional(),
  items: z.array(itemSchema).min(1),
  notas: z.string().optional(),
  direccionEntrega: z.string().optional(),
});

const IGV = 0.18;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const { socioId, solicitudRepuestoId, items, notas, direccionEntrega } = parsed.data;

  const socio = await prisma.socio.findUnique({ where: { id: socioId } });
  if (!socio) return NextResponse.json({ error: "Socio no encontrado" }, { status: 404 });

  const itemsConCalculo = items.map(item => ({
    ...item,
    subtotal: item.precioUnit * item.cantidad,
  }));

  const subtotalSinIgv = itemsConCalculo.reduce((s, i) => s + i.subtotal, 0) / (1 + IGV);
  const igv = itemsConCalculo.reduce((s, i) => s + i.subtotal, 0) - subtotalSinIgv;
  const total = itemsConCalculo.reduce((s, i) => s + i.subtotal, 0);

  const pedido = await prisma.$transaction(async (tx) => {
    const newPedido = await tx.pedido.create({
      data: {
        numero: generateNumero("PED", Date.now().toString()),
        socioId,
        notas,
        direccionEntrega,
        subtotal: subtotalSinIgv,
        igv,
        total,
        items: {
          create: itemsConCalculo.map(item => ({
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            precioUnit: item.precioUnit,
            costoUnit: item.costoUnit ?? null,
            subtotal: item.subtotal,
          })) as never[],
        },
      },
      include: { items: true },
    });

    // Link solicitud repuesto if provided
    if (solicitudRepuestoId) {
      await (tx as unknown as {
        solicitudRepuesto: { update: (args: unknown) => Promise<unknown> };
      }).solicitudRepuesto.update({
        where: { id: solicitudRepuestoId },
        data: { status: "EN_PROCESO", pedidoId: newPedido.id },
      });
    }

    await tx.notificacion.create({
      data: {
        socioId,
        tipo: "PEDIDO_CONFIRMADO",
        titulo: "Nuevo pedido generado",
        mensaje: `Se generó el pedido ${newPedido.numero} por S/ ${total.toFixed(2)} Inc. IGV.`,
        url: "/socio/pedidos",
      },
    });

    return newPedido;
  });

  return NextResponse.json(pedido, { status: 201 });
}
