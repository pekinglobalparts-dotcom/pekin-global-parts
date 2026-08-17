import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string(), orden: z.number() })),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin" || session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.items.map(({ id, orden }) =>
      prisma.producto.update({ where: { id }, data: { orden } })
    )
  );

  return NextResponse.json({ message: "Orden actualizado" });
}
