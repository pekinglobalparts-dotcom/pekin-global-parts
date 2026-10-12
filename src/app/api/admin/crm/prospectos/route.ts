import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// CRM — gestión de prospectos. Para administradores.
export const ETAPAS = ["NUEVO", "CONTACTADO", "COTIZADO", "NEGOCIACION", "GANADO", "PERDIDO"] as const;
const ORIGENES = ["WHATSAPP", "WEB", "REFERIDO", "OTRO"] as const;

const createSchema = z.object({
  nombre: z.string().min(1).max(200),
  telefono: z.string().max(40).optional().nullable(),
  empresa: z.string().max(200).optional().nullable(),
  origen: z.enum(ORIGENES).optional(),
  interes: z.string().max(500).optional().nullable(),
  etapa: z.enum(ETAPAS).optional(),
  valorEstimado: z.coerce.number().min(0).optional().nullable(),
  notas: z.string().max(2000).optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prospectos = await prisma.prospecto.findMany({
    orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
    include: {
      seguimientos: {
        where: { hecho: false },
        orderBy: { fecha: "asc" },
      },
    },
  });

  return NextResponse.json({ prospectos });
}

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
  const prospecto = await prisma.prospecto.create({
    data: {
      nombre: d.nombre,
      telefono: d.telefono || null,
      empresa: d.empresa || null,
      origen: d.origen || "WHATSAPP",
      interes: d.interes || null,
      etapa: d.etapa || "NUEVO",
      valorEstimado: d.valorEstimado ?? null,
      notas: d.notas || null,
    },
  });

  return NextResponse.json({ ok: true, prospecto }, { status: 201 });
}
