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

  const [solicitudes, total] = await Promise.all([
    prisma.solicitud.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { documentos: { orderBy: { createdAt: "asc" } } },
    }),
    prisma.solicitud.count({ where }),
  ]);

  return NextResponse.json({ solicitudes, total, page, limit });
}
