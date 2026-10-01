import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const itemSchema = z.object({
  descripcion: z.string().min(1).max(300),
  codigo: z.string().max(100).optional().nullable(),
  cantidad: z.coerce.number().int().min(1),
  precioUnit: z.coerce.number().min(0),
  costoUnit: z.coerce.number().min(0),
});

const updateSchema = z.object({
  cliente: z.string().max(200).optional().nullable(),
  docCliente: z.string().max(20).optional().nullable(),
  modalidad: z.enum(["CONTADO", "CREDITO"]).optional(),
  fecha: z.string().optional(),
  items: z.array(itemSchema).min(1).optional(),
  notas: z.string().max(1000).optional().nullable(),
});

// Editar una venta de mostrador — solo Super Admin.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "admin" || session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  const data: Record<string, unknown> = {};
  if (d.cliente !== undefined) data.cliente = d.cliente || null;
  if (d.docCliente !== undefined) data.docCliente = d.docCliente || null;
  if (d.modalidad !== undefined) data.modalidad = d.modalidad;
  if (d.fecha !== undefined) data.fecha = new Date(d.fecha);
  if (d.notas !== undefined) data.notas = d.notas || null;

  if (d.items) {
    const total = d.items.reduce((s, i) => s + i.precioUnit * i.cantidad, 0);
    const costoTotal = d.items.reduce((s, i) => s + i.costoUnit * i.cantidad, 0);
    data.total = total;
    data.costoTotal = costoTotal;
    data.ganancia = total - costoTotal;
    data.items = d.items.map(i => ({
      descripcion: i.descripcion,
      codigo: i.codigo || null,
      cantidad: i.cantidad,
      precioUnit: i.precioUnit,
      costoUnit: i.costoUnit,
    }));
  }

  const venta = await prisma.ventaMostrador.update({ where: { id }, data });
  return NextResponse.json({ ok: true, venta });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "admin" || session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.ventaMostrador.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
