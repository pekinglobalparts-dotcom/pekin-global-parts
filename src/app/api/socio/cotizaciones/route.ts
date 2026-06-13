import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cotizacionSchema } from "@/lib/validations";
import { generateNumero } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "socio") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cotizaciones = await prisma.cotizacion.findMany({
    where: { socioId: session.user.id },
    include: {
      items: {
        include: { producto: { select: { nombre: true, codigo: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(cotizaciones);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "socio") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = cotizacionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const cotizacion = await prisma.$transaction(async (tx) => {
    const newCotizacion = await tx.cotizacion.create({
      data: {
        numero: `COT-${Date.now()}`,
        socioId: session.user.id,
        notas: parsed.data.notas,
        items: {
          create: parsed.data.items.map((item) => ({
            productoId: item.productoId,
            cantidad: item.cantidad,
            notas: item.notas,
          })),
        },
      },
      include: { items: true },
    });

    await tx.notificacion.create({
      data: {
        socioId: session.user.id,
        tipo: "COTIZACION_NUEVA",
        titulo: "Cotización enviada",
        mensaje: `Su cotización ${newCotizacion.numero} fue recibida.`,
      },
    });

    return newCotizacion;
  });

  return NextResponse.json(cotizacion, { status: 201 });
}
