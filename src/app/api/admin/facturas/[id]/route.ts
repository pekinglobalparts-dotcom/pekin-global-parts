import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const round2 = (n: number) => Math.round(n * 100) / 100;
// Una factura "consume" crédito mientras está por cobrar.
const consumeCredito = (status: string) => status === "PENDIENTE" || status === "VENCIDA";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { status, pdfUrl, numeroReal } = body;

  const factura = await prisma.factura.findUnique({
    where: { id },
    select: { id: true, numero: true, status: true, total: true, socioId: true, pagadoAt: true },
  });
  if (!factura) return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (pdfUrl !== undefined) data.pdfUrl = pdfUrl;
  if (numeroReal !== undefined) data.numeroReal = numeroReal;

  // Sin cambio de estado: actualización simple.
  if (!status || status === factura.status) {
    if (status) data.status = status;
    const updated = await prisma.factura.update({ where: { id }, data });
    return NextResponse.json({ factura: updated });
  }

  data.status = status;

  // Fecha de pago: se registra al pasar a PAGADA, se limpia al salir de PAGADA.
  if (status === "PAGADA" && !factura.pagadoAt) data.pagadoAt = new Date();
  if (factura.status === "PAGADA" && status !== "PAGADA") data.pagadoAt = null;

  // Ajuste de crédito (solo socios a crédito). El crédito se libera al pagar o
  // anular, y se vuelve a consumir si una factura se reabre.
  const socio = await prisma.socio.findUnique({
    where: { id: factura.socioId },
    select: { tipoPago: true, lineaCredito: true, creditoUtilizado: true } as Record<string, unknown>,
  });
  const tipoPago = (socio as unknown as { tipoPago?: string })?.tipoPago ?? "CREDITO";

  const total = Number(factura.total);
  const antes = consumeCredito(factura.status);
  const despues = consumeCredito(status);
  const delta = (Number(despues) - Number(antes)) * total; // -total libera, +total reconsume

  if (socio && tipoPago === "CREDITO" && delta !== 0) {
    const utilizadoActual = Number((socio as unknown as { creditoUtilizado?: unknown }).creditoUtilizado ?? 0);
    const linea = Number((socio as unknown as { lineaCredito?: unknown }).lineaCredito ?? 0);
    const utilizadoNuevo = Math.max(0, round2(utilizadoActual + delta));

    const tipo = delta < 0
      ? (status === "PAGADA" ? "PAGO_RECIBIDO" : "CREDITO_LIBERADO")
      : "CREDITO_UTILIZADO";
    const descripcion = delta < 0
      ? (status === "PAGADA" ? `Pago recibido — factura ${factura.numero}` : `Factura ${factura.numero} anulada`)
      : `Factura ${factura.numero} reabierta`;

    await prisma.$transaction([
      prisma.factura.update({ where: { id }, data }),
      prisma.socio.update({ where: { id: factura.socioId }, data: { creditoUtilizado: utilizadoNuevo } }),
      prisma.movimientoCredito.create({
        data: {
          socioId: factura.socioId,
          tipo: tipo as never,
          monto: total,
          saldoAntes: round2(linea - utilizadoActual),
          saldoDespues: round2(linea - utilizadoNuevo),
          descripcion,
          referenciaId: factura.id,
        },
      }),
    ]);
    return NextResponse.json({ ok: true });
  }

  const updated = await prisma.factura.update({ where: { id }, data });
  return NextResponse.json({ factura: updated });
}
