import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Editar / eliminar un producto del catálogo — solo Super Admin.
const updateSchema = z.object({
  descripcion: z.string().min(1).max(300).optional(),
  codigo: z.string().max(100).optional().nullable(),
  marca: z.string().max(100).optional().nullable(),
  modelo: z.string().max(100).optional().nullable(),
  imagenUrl: z.string().url().max(1000).optional().nullable(),
  precioSocio: z.coerce.number().min(0).optional(),
  precioPublico: z.coerce.number().min(0).optional(),
  activo: z.boolean().optional(),
  destacado: z.boolean().optional(),
  orden: z.coerce.number().int().optional(),
});

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
  if (d.descripcion !== undefined) data.descripcion = d.descripcion;
  if (d.codigo !== undefined) data.codigo = d.codigo || null;
  if (d.marca !== undefined) data.marca = d.marca || null;
  if (d.modelo !== undefined) data.modelo = d.modelo || null;
  if (d.imagenUrl !== undefined) data.imagenUrl = d.imagenUrl || null;
  if (d.precioSocio !== undefined) data.precioSocio = d.precioSocio;
  if (d.precioPublico !== undefined) data.precioPublico = d.precioPublico;
  if (d.activo !== undefined) data.activo = d.activo;
  if (d.destacado !== undefined) data.destacado = d.destacado;
  if (d.orden !== undefined) data.orden = d.orden;

  const producto = await prisma.productoVitrina.update({ where: { id }, data });
  return NextResponse.json({ ok: true, producto });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "admin" || session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.productoVitrina.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
