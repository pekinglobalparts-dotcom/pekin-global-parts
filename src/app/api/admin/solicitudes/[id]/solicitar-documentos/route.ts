import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSolicitudDocumentos } from "@/lib/email";
import { randomBytes } from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.pekinglobalparts.com";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const solicitud = await prisma.solicitud.findUnique({ where: { id } });
  if (!solicitud) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const token = solicitud.tokenDocumentos ?? randomBytes(32).toString("hex");

  await prisma.solicitud.update({
    where: { id },
    data: {
      status: "EN_REVISION",
      tokenDocumentos: token,
      revisadoPor: session.user.id,
      revisadoAt: new Date(),
    },
  });

  const uploadUrl = `${APP_URL}/documentos/${token}`;

  try {
    await sendSolicitudDocumentos(solicitud.emailCorporativo, solicitud.razonSocial, uploadUrl);
  } catch (e) {
    console.error("[solicitar-documentos] email error", e);
  }

  return NextResponse.json({ ok: true, uploadUrl });
}
