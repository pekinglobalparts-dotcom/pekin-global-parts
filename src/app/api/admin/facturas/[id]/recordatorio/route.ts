import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendRecordatorioPago } from "@/lib/email";

// Envía un recordatorio de pago al socio (y CC a sus correos de cobranza),
// desde cobranzas@pekinglobalparts.com.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const factura = await prisma.factura.findUnique({
    where: { id },
    include: {
      socio: { select: { razonSocial: true, emailCorporativo: true, correosCobranza: true } },
    },
  });
  if (!factura) return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
  if (factura.status === "PAGADA" || factura.status === "ANULADA") {
    return NextResponse.json({ error: "La factura ya está pagada o anulada" }, { status: 400 });
  }

  const venc = factura.fechaVencimiento ? new Date(factura.fechaVencimiento) : null;
  const hoy = new Date();
  const vencida = !!venc && venc < hoy;
  const MS_DIA = 1000 * 60 * 60 * 24;
  const diasVencida = venc && vencida
    ? Math.floor((hoy.getTime() - venc.getTime()) / MS_DIA)
    : undefined;
  const diasParaVencer = venc && !vencida
    ? Math.ceil((venc.getTime() - hoy.getTime()) / MS_DIA)
    : undefined;

  // CC: correos adicionales del socio (separados por coma, punto y coma o espacios).
  const cc = (factura.socio.correosCobranza || "")
    .split(/[,;\s]+/)
    .map(s => s.trim())
    .filter(s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));

  try {
    await sendRecordatorioPago(
      factura.socio.emailCorporativo,
      {
        razonSocial: factura.socio.razonSocial,
        numeroFactura: factura.numeroReal || factura.numero,
        monto: Number(factura.total),
        fechaVencimiento: venc ? venc.toLocaleDateString("es-PE") : "—",
        vencida,
        diasVencida,
        diasParaVencer,
      },
      cc
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudo enviar el recordatorio";
    console.error("[recordatorio]", e);
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const actualizada = await prisma.factura.update({
    where: { id },
    data: { ultimoRecordatorio: new Date() },
    select: { ultimoRecordatorio: true },
  });

  return NextResponse.json({
    ok: true,
    enviadoA: factura.socio.emailCorporativo,
    cc,
    ultimoRecordatorio: actualizada.ultimoRecordatorio,
  });
}
