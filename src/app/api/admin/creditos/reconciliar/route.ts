import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Reconciliación de crédito — solo Super Admin.
// Corrige el crédito utilizado de cada socio a crédito (= suma de sus facturas
// aún por cobrar) y rellena los movimientos "Pago recibido" que faltan de las
// facturas ya marcadas como pagadas, para dejar el historial completo.
const round2 = (n: number) => Math.round(n * 100) / 100;

type Plan = {
  socioId: string;
  razonSocial: string;
  lineaCredito: number;
  utilizadoActual: number;
  utilizadoCorrecto: number;
  diferencia: number;
  pagosFaltantes: { facturaId: string; numero: string; total: number; fecha: string }[];
};

async function construirPlan(): Promise<Plan[]> {
  const socios = await prisma.socio.findMany({
    where: { tipoPago: "CREDITO" as never },
    select: { id: true, razonSocial: true, lineaCredito: true, creditoUtilizado: true },
  });

  const facturas = await prisma.factura.findMany({
    select: { id: true, numero: true, total: true, status: true, socioId: true, pagadoAt: true, updatedAt: true },
  });

  const movimientosPago = await prisma.movimientoCredito.findMany({
    where: { tipo: "PAGO_RECIBIDO" as never },
    select: { referenciaId: true },
  });
  const yaConPago = new Set(movimientosPago.map(m => m.referenciaId).filter(Boolean) as string[]);

  const planes: Plan[] = [];
  for (const s of socios) {
    const suyas = facturas.filter(f => f.socioId === s.id);
    const utilizadoCorrecto = round2(
      suyas.filter(f => f.status === "PENDIENTE" || f.status === "VENCIDA")
        .reduce((acc, f) => acc + Number(f.total), 0)
    );
    const pagosFaltantes = suyas
      .filter(f => f.status === "PAGADA" && !yaConPago.has(f.id))
      .map(f => ({
        facturaId: f.id,
        numero: f.numero,
        total: Number(f.total),
        fecha: (f.pagadoAt ?? f.updatedAt).toISOString(),
      }));

    const utilizadoActual = Number(s.creditoUtilizado);
    planes.push({
      socioId: s.id,
      razonSocial: s.razonSocial,
      lineaCredito: Number(s.lineaCredito),
      utilizadoActual,
      utilizadoCorrecto,
      diferencia: round2(utilizadoCorrecto - utilizadoActual),
      pagosFaltantes,
    });
  }
  return planes;
}

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin" || session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const planes = await construirPlan();
  // Solo los que tienen algo que corregir primero.
  planes.sort((a, b) => (Math.abs(b.diferencia) + b.pagosFaltantes.length) - (Math.abs(a.diferencia) + a.pagosFaltantes.length));
  return NextResponse.json({ planes });
}

export async function POST() {
  const session = await auth();
  if (!session || session.user.role !== "admin" || session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const planes = await construirPlan();
  let sociosAjustados = 0;
  let pagosRegistrados = 0;

  for (const p of planes) {
    const hayCambioSaldo = Math.abs(p.diferencia) >= 0.005;
    if (!hayCambioSaldo && p.pagosFaltantes.length === 0) continue;

    const disponibleFinal = round2(p.lineaCredito - p.utilizadoCorrecto);
    const ops: unknown[] = [];

    if (hayCambioSaldo) {
      ops.push(prisma.socio.update({
        where: { id: p.socioId },
        data: { creditoUtilizado: p.utilizadoCorrecto },
      }));
    }

    for (const pago of p.pagosFaltantes) {
      // Movimiento de pago retroactivo (conciliación) + fecha de pago si faltaba.
      ops.push(prisma.movimientoCredito.create({
        data: {
          socioId: p.socioId,
          tipo: "PAGO_RECIBIDO" as never,
          monto: pago.total,
          saldoAntes: disponibleFinal,
          saldoDespues: disponibleFinal,
          descripcion: `Pago recibido — factura ${pago.numero} (conciliación)`,
          referenciaId: pago.facturaId,
          createdAt: new Date(pago.fecha),
        },
      }));
      ops.push(prisma.factura.updateMany({
        where: { id: pago.facturaId, pagadoAt: null },
        data: { pagadoAt: new Date(pago.fecha) },
      }));
      pagosRegistrados++;
    }

    await prisma.$transaction(ops as never);
    sociosAjustados++;
  }

  return NextResponse.json({ ok: true, sociosAjustados, pagosRegistrados });
}
