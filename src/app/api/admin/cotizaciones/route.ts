import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where = status ? { status: status as never } : {};

  const [cotizaciones, total] = await Promise.all([
    prisma.cotizacion.findMany({
      where,
      include: {
        socio: { select: { razonSocial: true, emailCorporativo: true, ruc: true } },
        items: {
          include: { producto: { select: { nombre: true, codigo: true, precio: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.cotizacion.count({ where }),
  ]);

  return NextResponse.json({ cotizaciones, total });
}
