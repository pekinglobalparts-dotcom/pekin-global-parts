import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { generatePassword, generateNumero } from "@/lib/utils";
import {
  sendSolicitudAprobada,
  sendSolicitudRechazada,
} from "@/lib/email";

const accionSchema = z.object({
  accion: z.enum(["aprobar", "rechazar", "en_revision"]),
  motivo: z.string().optional(),
  lineaCredito: z.coerce.number().min(0).optional(),
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
  const parsed = accionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { accion, motivo, lineaCredito = 0 } = parsed.data;

  const solicitud = await prisma.solicitud.findUnique({ where: { id } });
  if (!solicitud) {
    return NextResponse.json(
      { error: "Solicitud no encontrada" },
      { status: 404 }
    );
  }

  if (accion === "en_revision") {
    await prisma.solicitud.update({
      where: { id },
      data: {
        status: "EN_REVISION",
        revisadoPor: session.user.id,
        revisadoAt: new Date(),
      },
    });
    return NextResponse.json({ message: "Estado actualizado" });
  }

  if (accion === "rechazar") {
    await prisma.solicitud.update({
      where: { id },
      data: {
        status: "RECHAZADA",
        motivoRechazo: motivo,
        revisadoPor: session.user.id,
        revisadoAt: new Date(),
      },
    });
    try {
      await sendSolicitudRechazada(
        solicitud.emailCorporativo,
        solicitud.razonSocial,
        motivo || "No cumple los requisitos actuales"
      );
    } catch (e) {
      console.error("Email error:", e);
    }
    return NextResponse.json({ message: "Solicitud rechazada" });
  }

  if (accion === "aprobar") {
    const existingSocio = await prisma.socio.findUnique({
      where: { ruc: solicitud.ruc },
    });
    if (existingSocio) {
      return NextResponse.json({ error: "Ya existe un socio con ese RUC" }, { status: 409 });
    }

    const password = generatePassword();
    const passwordHash = await bcrypt.hash(password, 12);

    const socio = await prisma.$transaction(async (tx) => {
      await tx.solicitud.update({
        where: { id },
        data: {
          status: "APROBADA",
          revisadoPor: session.user.id,
          revisadoAt: new Date(),
        },
      });

      const newSocio = await tx.socio.create({
        data: {
          solicitudId: id,
          razonSocial: solicitud.razonSocial,
          ruc: solicitud.ruc,
          emailCorporativo: solicitud.emailCorporativo,
          telefono: solicitud.telefono,
          sector: solicitud.sector,
          representanteLegal: solicitud.representanteLegal,
          cargo: solicitud.cargo,
          passwordHash,
          lineaCredito: lineaCredito,
        },
      });

      if (lineaCredito > 0) {
        await tx.movimientoCredito.create({
          data: {
            socioId: newSocio.id,
            tipo: "CREDITO_ASIGNADO",
            monto: lineaCredito,
            saldoAntes: 0,
            saldoDespues: lineaCredito,
            descripcion: "Línea de crédito inicial asignada",
          },
        });
      }

      await tx.notificacion.create({
        data: {
          socioId: newSocio.id,
          tipo: "SOLICITUD_APROBADA",
          titulo: "¡Bienvenido a Pekin Global Parts!",
          mensaje: "Su solicitud ha sido aprobada. Ya puede acceder al portal.",
        },
      });

      return newSocio;
    });

    try {
      await sendSolicitudAprobada(
        solicitud.emailCorporativo,
        solicitud.razonSocial,
        password
      );
    } catch (e) {
      console.error("Email error:", e);
    }

    await prisma.auditLog.create({
      data: {
        administradorId: session.user.id,
        accion: "APROBAR_SOLICITUD",
        entidad: "Solicitud",
        entidadId: id,
        datosDespues: { socioId: socio.id },
      },
    });

    return NextResponse.json({ message: "Solicitud aprobada", socioId: socio.id, password });
  }

  return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
}
