import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const marcas = await prisma.marca.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true },
  });
  return NextResponse.json(marcas);
}
