import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ETAPAS = ["NUEVO", "CONTACTADO", "COTIZADO", "NEGOCIACION", "GANADO", "PERDIDO"] as const;
const ORIGENES = ["WHATSAPP", "WEB", "REFERIDO", "OTRO"] as const;

const updateSchema = z.object({
  nombre: z.string().min(1).max(200).optional(),
  telefono: z.string().max(40).optional().nullable(),
  empresa: z.string().max(200).optional().nullable(),
  origen: z.enum(ORIGENES).optional(),
  interes: z.string().max(500).optional().nullable(),
  etapa: z.enum(ETAPAS).optional(),
  valorEstimado: z.coerce.number().min(0).optional().nullable(),
  notas: z.string().max(2000).optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
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
  if (d.nombre !== undefined) data.nombre = d.nombre;
  if (d.telefono !== undefined) data.telefono = d.telefono || null;
  if (d.empresa !== undefined) data.empresa = d.empresa || null;
  if (d.origen !== undefined) data.origen = d.origen;
  if (d.interes !== undefined) data.interes = d.interes || null;
  if (d.etapa !== undefined) data.etapa = d.etapa;
  if (d.valorEstimado !== undefined) data.valorEstimado = d.valorEstimado ?? null;
  if (d.notas !== undefined) data.notas = d.notas || null;

  const prospecto = await prisma.prospecto.update({ where: { id }, data });
  return NextResponse.json({ ok: true, prospecto });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.prospecto.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
