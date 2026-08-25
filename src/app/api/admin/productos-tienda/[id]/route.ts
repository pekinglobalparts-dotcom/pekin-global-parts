import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  codigo: z.string().min(1).max(80).optional(),
  descripcion: z.string().min(1).max(300).optional(),
  precio: z.coerce.number().min(0).optional(),
  costo: z.coerce.number().min(0).nullable().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  stockMinimo: z.coerce.number().int().min(0).optional(),
  activo: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "admin" || session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  // Si cambia el código, verificar que no choque con otro
  if (parsed.data.codigo) {
    const otro = await prisma.productoTienda.findUnique({ where: { codigo: parsed.data.codigo } });
    if (otro && otro.id !== id) {
      return NextResponse.json({ error: "Ya existe otro producto con ese código." }, { status: 409 });
    }
  }
  const producto = await prisma.productoTienda.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true, producto });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "admin" || session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.productoTienda.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
