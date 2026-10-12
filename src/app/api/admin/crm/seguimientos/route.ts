import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// CRM — crear tareas de seguimiento.
const createSchema = z.object({
  prospectoId: z.string().optional().nullable(),
  titulo: z.string().min(1).max(300),
  fecha: z.string(), // YYYY-MM-DD o ISO
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  const seguimiento = await prisma.seguimientoCRM.create({
    data: {
      prospectoId: d.prospectoId || null,
      titulo: d.titulo,
      fecha: new Date(d.fecha),
    },
  });

  return NextResponse.json({ ok: true, seguimiento }, { status: 201 });
}
