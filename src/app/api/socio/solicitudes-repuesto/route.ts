import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateNumero } from "@/lib/utils";

const createSchema = z.object({
  marcaVehiculo: z.string().optional(),
  modeloVehiculo: z.string().optional(),
  anioVehiculo: z.string().optional(),
  descripcion: z.string().min(5),
  cantidad: z.coerce.number().int().min(1).default(1),
  notas: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "socio") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const solicitudes = await (prisma as unknown as {
    solicitudRepuesto: {
      findMany: (args: unknown) => Promise<unknown[]>;
    };
  }).solicitudRepuesto.findMany({
    where: { socioId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { pedido: { select: { status: true, numero: true } } },
  });

  return NextResponse.json({ solicitudes });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "socio") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const solicitud = await (prisma as unknown as {
    solicitudRepuesto: {
      create: (args: unknown) => Promise<unknown>;
    };
  }).solicitudRepuesto.create({
    data: {
      numero: generateNumero("SR", Date.now().toString()),
      socioId: session.user.id,
      ...parsed.data,
    },
  });

  await prisma.notificacion.create({
    data: {
      socioId: session.user.id,
      tipo: "SOLICITUD_APROBADA",
      titulo: "Solicitud de repuesto recibida",
      mensaje: `Su solicitud de repuesto específico fue enviada. Nuestro equipo le responderá pronto.`,
      url: "/socio/solicitudes-repuesto",
    },
  });

  return NextResponse.json(solicitud, { status: 201 });
}
