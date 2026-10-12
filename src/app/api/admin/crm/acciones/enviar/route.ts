import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAcciones } from "@/lib/crm";
import { sendRecordatorioPago, sendMensajeCRM } from "@/lib/email";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  clave: z.string().min(1),
  tipo: z.string().min(1),
  accion: z.enum(["ENVIAR", "DESCARTAR", "POSPONER"]),
  canal: z.enum(["WHATSAPP", "EMAIL"]).optional(),
  snoozeDias: z.coerce.number().min(1).max(365).optional(),
});

async function marcar(clave: string, tipo: string, estado: string, canal?: string, snoozeHasta?: Date) {
  await prisma.accionCRM.upsert({
    where: { clave },
    create: { clave, tipo, estado, canal: canal ?? null, snoozeHasta: snoozeHasta ?? null },
    update: { estado, canal: canal ?? null, snoozeHasta: snoozeHasta ?? null, updatedAt: new Date() },
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { clave, tipo, accion, canal, snoozeDias } = parsed.data;

  // Descartar: no se vuelve a sugerir.
  if (accion === "DESCARTAR") {
    await marcar(clave, tipo, "DESCARTADA");
    return NextResponse.json({ ok: true, estado: "DESCARTADA" });
  }

  // Posponer: se oculta hasta la fecha indicada.
  if (accion === "POSPONER") {
    const dias = snoozeDias ?? 3;
    const hasta = new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
    await marcar(clave, tipo, "POSPUESTA", undefined, hasta);
    return NextResponse.json({ ok: true, estado: "POSPUESTA", snoozeHasta: hasta });
  }

  // ENVIAR
  // Por WhatsApp el cliente ya abrió el chat; solo registramos el envío.
  if (canal === "WHATSAPP") {
    await marcar(clave, tipo, "ENVIADA", "WHATSAPP");
    return NextResponse.json({ ok: true, estado: "ENVIADA", canal: "WHATSAPP" });
  }

  // Por correo: lo envía el servidor. Regeneramos la acción para usar el
  // texto generado del lado del servidor (no confiamos en el del cliente).
  if (canal === "EMAIL") {
    const acciones = await getAcciones();
    const acc = acciones.find(a => a.clave === clave);
    if (!acc) {
      return NextResponse.json({ error: "La acción ya no está disponible (los datos cambiaron)." }, { status: 409 });
    }

    try {
      if (acc.tipo === "COBRANZA" && acc.ref.facturaId) {
        // Usa la plantilla oficial de cobranza (y CC a los correos de cobranza).
        const f = await prisma.factura.findUnique({
          where: { id: acc.ref.facturaId },
          include: { socio: { select: { razonSocial: true, emailCorporativo: true, correosCobranza: true } } },
        });
        if (!f) return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
        if (f.status === "PAGADA" || f.status === "ANULADA") {
          return NextResponse.json({ error: "La factura ya está pagada o anulada." }, { status: 400 });
        }
        const venc = new Date(f.fechaVencimiento);
        const vencida = venc < new Date();
        const MS = 86400000;
        await sendRecordatorioPago(
          f.socio.emailCorporativo,
          {
            razonSocial: f.socio.razonSocial,
            numeroFactura: f.numeroReal || f.numero,
            monto: Number(f.total),
            fechaVencimiento: venc.toLocaleDateString("es-PE"),
            vencida,
            diasVencida: vencida ? Math.floor((Date.now() - venc.getTime()) / MS) : undefined,
            diasParaVencer: !vencida ? Math.ceil((venc.getTime() - Date.now()) / MS) : undefined,
          },
          (f.socio.correosCobranza || "").split(/[,;\s]+/).map(s => s.trim())
            .filter(s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)),
        );
        await prisma.factura.update({ where: { id: f.id }, data: { ultimoRecordatorio: new Date() } });
      } else if (acc.email) {
        await sendMensajeCRM(acc.cliente.email, acc.email.asunto, acc.email.saludo, acc.email.parrafos, acc.email.cta);
      } else {
        return NextResponse.json({ error: "Esta acción no tiene correo; use WhatsApp." }, { status: 400 });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo enviar el correo";
      console.error("[crm/enviar]", e);
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    await marcar(clave, tipo, "ENVIADA", "EMAIL");
    return NextResponse.json({ ok: true, estado: "ENVIADA", canal: "EMAIL" });
  }

  return NextResponse.json({ error: "Falta el canal de envío." }, { status: 400 });
}
