import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoriaId = searchParams.get("categoriaId");
  const marcaId = searchParams.get("marcaId");
  const search = searchParams.get("search");
  const destacado = searchParams.get("destacado");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { activo: true };
  if (categoriaId) where.categoriaId = categoriaId;
  if (marcaId) where.marcaId = marcaId;
  if (destacado === "true") where.destacado = true;
  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: "insensitive" } },
      { codigo: { contains: search, mode: "insensitive" } },
      { descripcion: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        include: {
          categoria: { select: { nombre: true, slug: true } },
          marca: { select: { nombre: true } },
        },
        orderBy: [{ orden: "asc" }, { destacado: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.producto.count({ where }),
    ]);

    return NextResponse.json({ productos, total, page, limit });
  } catch (error) {
    console.error("[/api/productos] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
