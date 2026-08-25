import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Catálogo de tienda (POS). Buscar/listar: cualquier admin. Crear: solo Super Admin.
const createSchema = z.object({
  codigo: z.string().min(1).max(80),
  descripcion: z.string().min(1).max(300),
  precio: z.coerce.number().min(0),
  costo: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0).optional(),
  stockMinimo: z.coerce.number().int().min(0).optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const esSuperAdmin = session.user.adminRole === "SUPER_ADMIN";
  const search = (new URL(req.url).searchParams.get("search") || "").trim();

  const where = search
    ? { OR: [
        { codigo: { contains: search, mode: "insensitive" as const } },
        { descripcion: { contains: search, mode: "insensitive" as const } },
      ] }
    : {};

  const productos = await prisma.productoTienda.findMany({
    where,
    orderBy: { descripcion: "asc" },
    take: 100,
  });

  // El costo es privado del dueño: se oculta a admin normal.
  const salida = esSuperAdmin
    ? productos
    : productos.map(({ costo, ...resto }) => { void costo; return resto; });

  return NextResponse.json({ productos: salida, esSuperAdmin });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin" || session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const d = parsed.data;
  const existe = await prisma.productoTienda.findUnique({ where: { codigo: d.codigo } });
  if (existe) {
    return NextResponse.json({ error: "Ya existe un producto con ese código." }, { status: 409 });
  }
  const producto = await prisma.productoTienda.create({
    data: {
      codigo: d.codigo,
      descripcion: d.descripcion,
      precio: d.precio,
      costo: d.costo ?? null,
      stock: d.stock ?? 0,
      stockMinimo: d.stockMinimo ?? 0,
    },
  });
  return NextResponse.json({ ok: true, producto }, { status: 201 });
}
