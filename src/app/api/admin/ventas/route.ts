import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateNumero } from "@/lib/utils";

// Ventas de mostrador / contado — solo Super Admin.
const itemSchema = z.object({
  descripcion: z.string().min(1).max(300),
  codigo: z.string().max(100).optional().nullable(),
  cantidad: z.coerce.number().int().min(1),
  precioUnit: z.coerce.number().min(0),
  costoUnit: z.coerce.number().min(0),
});

const createSchema = z.object({
  cliente: z.string().max(200).optional().nullable(),
  docCliente: z.string().max(20).optional().nullable(),
  modalidad: z.enum(["CONTADO", "CREDITO"]).optional(),
  fecha: z.string().optional(),
  items: z.array(itemSchema).min(1),
  notas: z.string().max(1000).optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin" || session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ventas = await prisma.ventaMostrador.findMany({
    orderBy: { fecha: "desc" },
    take: 100,
  });

  return NextResponse.json({ ventas });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin" || session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const { cliente, docCliente, modalidad, fecha, items, notas } = parsed.data;

  const total = items.reduce((s, i) => s + i.precioUnit * i.cantidad, 0);
  const costoTotal = items.reduce((s, i) => s + i.costoUnit * i.cantidad, 0);
  const ganancia = total - costoTotal;

  const venta = await prisma.ventaMostrador.create({
    data: {
      numero: generateNumero("VM", Date.now().toString()),
      cliente: cliente || null,
      docCliente: docCliente || null,
      modalidad: modalidad || "CONTADO",
      fecha: fecha ? new Date(fecha) : new Date(),
      total,
      costoTotal,
      ganancia,
      items: items.map(i => ({
        descripcion: i.descripcion,
        codigo: i.codigo || null,
        cantidad: i.cantidad,
        precioUnit: i.precioUnit,
        costoUnit: i.costoUnit,
      })),
      notas: notas || null,
    },
  });

  return NextResponse.json({ ok: true, venta }, { status: 201 });
}
