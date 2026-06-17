import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["ACTIVO", "SUSPENDIDO", "INACTIVO"]).optional(),
  lineaCredito: z.coerce.number().min(0).optional(),
  tipoPago: z.enum(["CREDITO", "CONTADO"]).optional(),
  plazoCredito: z.coerce.number().int().min(0).optional(),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const socio = await prisma.socio.findUnique({
    where: { id },
    include: {
      cotizaciones: { orderBy: { createdAt: "desc" }, take: 5 },
      pedidos: { orderBy: { createdAt: "desc" }, take: 5 },
      facturas: { orderBy: { createdAt: "desc" }, take: 5 },
      movimientos: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!socio) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(socio);
}

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

  const { lineaCredito, tipoPago, plazoCredito, ...rest } = parsed.data;

  // Only SUPER_ADMIN can touch credit/payment fields
  const isSuperAdmin = session.user.adminRole === "SUPER_ADMIN";
  if ((lineaCredito !== undefined || tipoPago !== undefined || plazoCredito !== undefined) && !isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden: solo SUPER_ADMIN puede modificar crédito" }, { status: 403 });
  }

  const socioActual = await prisma.socio.findUnique({
    where: { id },
    select: { lineaCredito: true, creditoUtilizado: true },
  });
  if (!socioActual) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const updateData: Record<string, unknown> = { ...rest };
  if (tipoPago !== undefined) updateData.tipoPago = tipoPago;
  if (plazoCredito !== undefined) updateData.plazoCredito = plazoCredito;

  if (lineaCredito !== undefined) {
    updateData.lineaCredito = lineaCredito;
    const diff = lineaCredito - Number(socioActual.lineaCredito);
    if (diff !== 0) {
      await prisma.movimientoCredito.create({
        data: {
          socioId: id,
          tipo: diff > 0 ? "CREDITO_ASIGNADO" : "CREDITO_LIBERADO",
          monto: Math.abs(diff),
          saldoAntes: Number(socioActual.lineaCredito),
          saldoDespues: lineaCredito,
          descripcion: `Línea de crédito ${diff > 0 ? "incrementada" : "reducida"} por administrador`,
        },
      });
    }
  }

  const socio = await prisma.socio.update({
    where: { id },
    data: updateData,
  });

  await prisma.auditLog.create({
    data: {
      administradorId: session.user.id,
      accion: "ACTUALIZAR_SOCIO",
      entidad: "Socio",
      entidadId: id,
      datosDespues: JSON.parse(JSON.stringify(updateData)),
    },
  });

  return NextResponse.json(socio);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden: solo SUPER_ADMIN puede eliminar socios" }, { status: 403 });
  }

  const { id } = await params;
  const socio = await prisma.socio.findUnique({ where: { id } });
  if (!socio) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  // Delete related records first
  await prisma.notificacion.deleteMany({ where: { socioId: id } });
  await prisma.movimientoCredito.deleteMany({ where: { socioId: id } });
  await prisma.socio.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      administradorId: session.user.id,
      accion: "ELIMINAR_SOCIO",
      entidad: "Socio",
      entidadId: id,
      datosDespues: JSON.parse(JSON.stringify({ razonSocial: socio.razonSocial, ruc: socio.ruc })),
    },
  });

  return NextResponse.json({ message: "Socio eliminado" });
}
