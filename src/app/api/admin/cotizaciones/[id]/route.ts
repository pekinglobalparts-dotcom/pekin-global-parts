import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendCotizacionRespondida } from "@/lib/email";

const respondSchema = z.object({
  respuesta: z.string().min(1),
  validaHasta: z.string().optional(),
  items: z.array(z.object({
    id: z.string(),
    precioUnit: z.coerce.number().positive(),
  })),
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
  const parsed = respondSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const { respuesta, validaHasta, items } = parsed.data;

  const total = items.reduce((sum, item) => {
    const cotItem = item as { precioUnit: number; cantidad?: number };
    return sum + item.precioUnit;
  }, 0);

  const cotizacion = await prisma.$transaction(async (tx) => {
    // Update each item with unit price and subtotal
    for (const item of items) {
      const cotItem = await tx.cotizacionItem.findUnique({ where: { id: item.id } });
      if (cotItem) {
        await tx.cotizacionItem.update({
          where: { id: item.id },
          data: {
            precioUnit: item.precioUnit,
            subtotal: item.precioUnit * cotItem.cantidad,
          },
        });
      }
    }

    // Calculate real total from items
    const updatedItems = await tx.cotizacionItem.findMany({ where: { cotizacionId: id } });
    const realTotal = updatedItems.reduce((sum, i) => sum + Number(i.subtotal || 0), 0);

    const updated = await tx.cotizacion.update({
      where: { id },
      data: {
        status: "ENVIADA",
        respuesta,
        total: realTotal,
        validaHasta: validaHasta ? new Date(validaHasta) : null,
      },
      include: {
        socio: { select: { emailCorporativo: true, razonSocial: true } },
      },
    });

    await tx.notificacion.create({
      data: {
        socioId: updated.socioId,
        tipo: "COTIZACION_RESPONDIDA",
        titulo: "Cotización respondida",
        mensaje: `Su cotización ${updated.numero} ha sido respondida. Revise el detalle.`,
        url: "/socio/cotizaciones",
      },
    });

    return updated;
  });

  try {
    await sendCotizacionRespondida(
      cotizacion.socio.emailCorporativo,
      cotizacion.socio.razonSocial,
      cotizacion.numero
    );
  } catch (e) {
    console.error("Email error:", e);
  }

  return NextResponse.json(cotizacion);
}
