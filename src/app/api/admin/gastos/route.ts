import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Gastos del negocio — solo Super Admin.
export const CATEGORIAS = ["Compra de stock", "Transporte / Envíos", "Publicidad", "Impuestos", "Otros"] as const;

const createSchema = z.object({
  categoria: z.string().min(1).max(100),
  monto: z.coerce.number().min(0),
  fecha: z.string().optional(),
  descripcion: z.string().max(500).optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin" || session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const gastos = await prisma.gasto.findMany({ orderBy: { fecha: "desc" }, take: 200 });
  return NextResponse.json({ gastos });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin" || session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { categoria, monto, fecha, descripcion } = parsed.data;
  const gasto = await prisma.gasto.create({
    data: {
      categoria,
      monto,
      fecha: fecha ? new Date(fecha) : new Date(),
      descripcion: descripcion || null,
    },
  });
  return NextResponse.json({ ok: true, gasto }, { status: 201 });
}
