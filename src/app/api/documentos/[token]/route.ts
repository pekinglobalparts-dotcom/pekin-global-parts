import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDocumentosRecibidos } from "@/lib/email";
import { z } from "zod";
import { randomBytes } from "crypto";

function createId() { return randomBytes(12).toString("hex"); }

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "pekinglobalparts@gmail.com";
const ADMIN_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/admin/solicitudes`
  : "https://socios.pekinglobalparts.com/admin/solicitudes";

const docSchema = z.object({
  tipo: z.string().min(1),
  nombre: z.string().min(1),
  url: z.string().url(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const solicitud = await prisma.solicitud.findUnique({
    where: { tokenDocumentos: token },
    include: { documentos: { orderBy: { createdAt: "asc" } } },
  });

  if (!solicitud) {
    return NextResponse.json({ error: "Enlace inválido o expirado" }, { status: 404 });
  }

  return NextResponse.json({
    razonSocial: solicitud.razonSocial,
    ruc: solicitud.ruc,
    status: solicitud.status,
    documentosAt: solicitud.documentosAt,
    documentos: solicitud.documentos,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const solicitud = await prisma.solicitud.findUnique({
    where: { tokenDocumentos: token },
    include: { documentos: true },
  });

  if (!solicitud || solicitud.status === "APROBADA" || solicitud.status === "RECHAZADA") {
    return NextResponse.json({ error: "Solicitud no válida" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = docSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const doc = await prisma.documentoCredito.create({
    data: {
      id: createId(),
      solicitudId: solicitud.id,
      tipo: parsed.data.tipo,
      nombre: parsed.data.nombre,
      url: parsed.data.url,
    },
  });

  const isFirst = solicitud.documentos.length === 0;
  if (isFirst) {
    await prisma.solicitud.update({
      where: { id: solicitud.id },
      data: { documentosAt: new Date() },
    });
    try {
      await sendDocumentosRecibidos(ADMIN_EMAIL, solicitud.razonSocial, solicitud.ruc, ADMIN_URL);
    } catch (e) {
      console.error("[documentos] email error", e);
    }
  }

  return NextResponse.json(doc, { status: 201 });
}
