import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Vitrina para socios: mismo catálogo, pero al precio que se les factura.
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productos = await prisma.productoVitrina.findMany({
    where: { activo: true },
    orderBy: [{ destacado: "desc" }, { orden: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      codigo: true,
      descripcion: true,
      marca: true,
      modelo: true,
      imagenUrl: true,
      precioSocio: true,
      destacado: true,
    },
  });

  return NextResponse.json({ productos });
}
