import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateNumero } from "@/lib/utils";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "socio") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { action } = await req.json(); // "ACEPTAR" | "RECHAZAR"

  const cotizacion = await prisma.cotizacion.findUnique({
    where: { id, socioId: session.user.id },
    include: { items: { include: { producto: true } } },
  });

  if (!cotizacion) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (cotizacion.status !== "ENVIADA") {
    return NextResponse.json({ error: "Solo se pueden aceptar cotizaciones respondidas" }, { status: 400 });
  }

  if (action === "RECHAZAR") {
    await prisma.cotizacion.update({
      where: { id },
      data: { status: "RECHAZADA" },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "ACEPTAR") {
    const result = await prisma.$transaction(async (tx) => {
      await tx.cotizacion.update({ where: { id }, data: { status: "ACEPTADA" } });

      const subtotal = cotizacion.items.reduce((s, item) => {
        return s + Number(item.precioUnit || item.producto.precio) * item.cantidad;
      }, 0);
      const igv = subtotal * 0.18;
      const total = subtotal + igv;

      const pedido = await tx.pedido.create({
        data: {
          numero: generateNumero("PED", Date.now().toString()),
          socioId: session.user.id,
          cotizacionId: id,
          subtotal,
          igv,
          total,
          items: {
            create: cotizacion.items.map(item => ({
              productoId: item.productoId,
              cantidad: item.cantidad,
              precioUnit: Number(item.precioUnit || item.producto.precio),
              subtotal: Number(item.precioUnit || item.producto.precio) * item.cantidad,
            })),
          },
        },
      });

      await tx.notificacion.create({
        data: {
          socioId: session.user.id,
          tipo: "PEDIDO_CONFIRMADO",
          titulo: "Pedido generado",
          mensaje: `Su pedido ${pedido.numero} fue creado a partir de la cotización aceptada.`,
          url: "/socio/pedidos",
        },
      });

      return pedido;
    });

    return NextResponse.json({ pedido: result });
  }

  return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
}
