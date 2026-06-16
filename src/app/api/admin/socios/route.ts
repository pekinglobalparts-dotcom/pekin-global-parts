import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { razonSocial: { contains: search, mode: "insensitive" } },
      { ruc: { contains: search } },
      { emailCorporativo: { contains: search, mode: "insensitive" } },
    ];
  }

  const [socios, total] = await Promise.all([
    prisma.socio.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true, razonSocial: true, ruc: true, emailCorporativo: true,
        telefono: true, sector: true, status: true,
        lineaCredito: true, creditoUtilizado: true,
        createdAt: true,
        _count: { select: { pedidos: true, cotizaciones: true } },
      },
    }),
    prisma.socio.count({ where }),
  ]);

  const sociosWithExtra = (socios as unknown as Array<typeof socios[0] & { tipoPago?: string; plazoCredito?: number }>);
  return NextResponse.json({ socios: sociosWithExtra, total, page, limit });
}
