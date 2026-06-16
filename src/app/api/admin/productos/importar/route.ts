import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Bulk import endpoint — upserts categorias/marcas by name, then creates products
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productos } = await req.json() as {
    productos: Array<{
      codigo: string;
      nombre: string;
      descripcion?: string;
      categoria: string;  // name, will be upserted
      modelosCompatibles: string[];
      precio: number;
      stock: number;
    }>;
  };

  if (!Array.isArray(productos) || productos.length === 0) {
    return NextResponse.json({ error: "Sin productos" }, { status: 400 });
  }

  // Upsert a single "Sin marca" entry so no brand is shown
  const marcaSinMarca = await prisma.marca.upsert({
    where: { nombre: "Sin marca" },
    update: {},
    create: { nombre: "Sin marca", activo: true },
  });

  // Collect unique category names and upsert all
  const categoriaNombres = [...new Set(productos.map(p => p.categoria))];
  const categoriaMap: Record<string, string> = {};
  for (const nombre of categoriaNombres) {
    const cat = await prisma.categoria.upsert({
      where: { nombre },
      update: {},
      create: { nombre, slug: nombre.toLowerCase().replace(/\s+/g, "-").replace(/[áéíóú]/g, c => ({ á:"a",é:"e",í:"i",ó:"o",ú:"u" }[c]??c)), activo: true },
    });
    categoriaMap[nombre] = cat.id;
  }

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const p of productos) {
    try {
      await prisma.producto.upsert({
        where: { codigo: p.codigo },
        update: {
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: p.precio,
          modelosCompatibles: p.modelosCompatibles,
          categoriaId: categoriaMap[p.categoria],
          marcaId: marcaSinMarca.id,
          activo: true,
        },
        create: {
          codigo: p.codigo,
          nombre: p.nombre,
          descripcion: p.descripcion,
          imagenUrl: "",
          categoriaId: categoriaMap[p.categoria],
          marcaId: marcaSinMarca.id,
          modelosCompatibles: p.modelosCompatibles,
          precio: p.precio,
          stock: p.stock,
          stockMinimo: 2,
          unidad: "und",
          activo: true,
          destacado: false,
        },
      });
      created++;
    } catch (e) {
      errors.push(`${p.codigo}: ${(e as Error).message}`);
      skipped++;
    }
  }

  return NextResponse.json({ created, skipped, errors });
}
