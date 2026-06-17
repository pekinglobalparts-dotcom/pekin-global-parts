import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const resetSchema = z.object({
  solicitudes: z.boolean().optional(),
  solicitudesStatus: z.array(z.string()).optional(),
  socioIds: z.array(z.string()).optional(),
  pedidos: z.boolean().optional(),
  facturas: z.boolean().optional(),
  cotizaciones: z.boolean().optional(),
  notificaciones: z.boolean().optional(),
  movimientosCredito: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const opts = parsed.data;
  const deleted: Record<string, number> = {};

  // Order matters: delete dependents before parents
  if (opts.movimientosCredito || opts.socioIds?.length) {
    const where = opts.socioIds?.length ? { socioId: { in: opts.socioIds } } : {};
    const r = await prisma.movimientoCredito.deleteMany({ where });
    deleted.movimientosCredito = r.count;
  }

  if (opts.notificaciones || opts.socioIds?.length) {
    const where = opts.socioIds?.length ? { socioId: { in: opts.socioIds } } : {};
    const r = await prisma.notificacion.deleteMany({ where });
    deleted.notificaciones = r.count;
  }

  if (opts.facturas || opts.socioIds?.length) {
    const where = opts.socioIds?.length ? { socioId: { in: opts.socioIds } } : {};
    const r = await prisma.factura.deleteMany({ where });
    deleted.facturas = r.count;
  }

  if (opts.pedidos || opts.socioIds?.length) {
    const where = opts.socioIds?.length ? { socioId: { in: opts.socioIds } } : {};
    const r = await prisma.pedido.deleteMany({ where });
    deleted.pedidos = r.count;
  }

  if (opts.cotizaciones || opts.socioIds?.length) {
    const where = opts.socioIds?.length ? { socioId: { in: opts.socioIds } } : {};
    const r = await prisma.cotizacion.deleteMany({ where });
    deleted.cotizaciones = r.count;
  }

  if (opts.socioIds?.length) {
    const r = await prisma.socio.deleteMany({ where: { id: { in: opts.socioIds } } });
    deleted.socios = r.count;
  }

  if (opts.solicitudes) {
    const where = opts.solicitudesStatus?.length
      ? { status: { in: opts.solicitudesStatus as never[] } }
      : {};
    const r = await prisma.solicitud.deleteMany({ where });
    deleted.solicitudes = r.count;
  }

  return NextResponse.json({ ok: true, deleted });
}
