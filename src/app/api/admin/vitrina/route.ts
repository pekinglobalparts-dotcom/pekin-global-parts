import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Gestión del catálogo / vitrina — solo Super Admin.
const createSchema = z.object({
  descripcion: z.string().min(1).max(300),
  codigo: z.string().max(100).optional().nullable(),
  marca: z.string().max(100).optional().nullable(),
  modelo: z.string().max(100).optional().nullable(),
  imagenUrl: z.string().url().max(1000).optional().nullable(),
  precioSocio: z.coerce.number().min(0),
  precioPublico: z.coerce.number().min(0),
  activo: z.boolean().optional(),
  destacado: z.boolean().optional(),
  origen: z.string().max(50).optional().nullable(),
  origenId: z.string().max(100).optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin" || session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productos = await prisma.productoVitrina.findMany({
    orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ productos });
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

  const d = parsed.data;
  const producto = await prisma.productoVitrina.create({
    data: {
      descripcion: d.descripcion,
      codigo: d.codigo || null,
      marca: d.marca || null,
      modelo: d.modelo || null,
      imagenUrl: d.imagenUrl || null,
      precioSocio: d.precioSocio,
      precioPublico: d.precioPublico,
      activo: d.activo ?? true,
      destacado: d.destacado ?? false,
      origen: d.origen || null,
      origenId: d.origenId || null,
    },
  });

  return NextResponse.json({ ok: true, producto }, { status: 201 });
}
