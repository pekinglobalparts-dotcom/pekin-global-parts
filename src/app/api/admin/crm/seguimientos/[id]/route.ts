import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  hecho: z.boolean().optional(),
  titulo: z.string().min(1).max(300).optional(),
  fecha: z.string().optional(),
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
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const d = parsed.data;
  const data: Record<string, unknown> = {};
  if (d.hecho !== undefined) data.hecho = d.hecho;
  if (d.titulo !== undefined) data.titulo = d.titulo;
  if (d.fecha !== undefined) data.fecha = new Date(d.fecha);

  const seguimiento = await prisma.seguimientoCRM.update({ where: { id }, data });
  return NextResponse.json({ ok: true, seguimiento });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.seguimientoCRM.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
