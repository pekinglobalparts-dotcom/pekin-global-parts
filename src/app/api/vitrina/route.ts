import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Vitrina pública: catálogo con foto y precio público (+15% sobre socio).
// No expone el precio de socio.
export async function GET() {
  const productos = await prisma.productoVitrina.findMany({
    where: { activo: true },
    orderBy: [{ enStock: "desc" }, { destacado: "desc" }, { orden: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      codigo: true,
      descripcion: true,
      marca: true,
      modelo: true,
      imagenUrl: true,
      precioPublico: true,
      destacado: true,
      enStock: true,
    },
  });

  return NextResponse.json({ productos });
}
