import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Editar un pedido — solo Super Admin.
// Seguridad financiera: si el pedido ya tiene factura emitida, se permiten
// correcciones de descripción pero NO cambios en cantidades/precios (eso
// alteraría la factura y el crédito consumido del socio).
const IGV = 0.18;

const itemSchema = z.object({
  id: z.string().optional(),
  descripcion: z.string().min(1).max(300),
  cantidad: z.coerce.number().int().min(1),
  precioUnit: z.coerce.number().min(0),
  costoUnit: z.coerce.number().min(0).optional().nullable(),
});

const updateSchema = z.object({
  notas: z.string().max(1000).optional().nullable(),
  direccionEntrega: z.string().max(500).optional().nullable(),
  items: z.array(itemSchema).min(1),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "admin" || session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }
  const { notas, direccionEntrega, items } = parsed.data;

  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: { factura: { select: { id: true } } },
  });
  if (!pedido) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

  const sumConIgv = items.reduce((s, i) => s + i.precioUnit * i.cantidad, 0);
  const subtotal = sumConIgv / (1 + IGV);
  const igv = sumConIgv - subtotal;
  const total = sumConIgv;

  const totalCambia = Math.abs(total - Number(pedido.total)) > 0.005;
  if (pedido.factura && totalCambia) {
    return NextResponse.json({
      error: "Este pedido ya tiene factura emitida: puedes corregir las descripciones, pero no las cantidades ni los precios (cambiaría la factura y el crédito del socio).",
    }, { status: 409 });
  }

  await prisma.$transaction(async (tx) => {
    const keepIds = items.filter(i => i.id).map(i => i.id as string);
    await tx.pedidoItem.deleteMany({
      where: { pedidoId: id, id: { notIn: keepIds.length ? keepIds : ["__none__"] } },
    });
    for (const it of items) {
      const data = {
        descripcion: it.descripcion,
        cantidad: it.cantidad,
        precioUnit: it.precioUnit,
        costoUnit: it.costoUnit ?? null,
        subtotal: it.precioUnit * it.cantidad,
      };
      if (it.id) await tx.pedidoItem.update({ where: { id: it.id }, data });
      else await tx.pedidoItem.create({ data: { ...data, pedidoId: id } });
    }
    await tx.pedido.update({
      where: { id },
      data: {
        notas: notas ?? null,
        direccionEntrega: direccionEntrega ?? null,
        subtotal,
        igv,
        total,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
