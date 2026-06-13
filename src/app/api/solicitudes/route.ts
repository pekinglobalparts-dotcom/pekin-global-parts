import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { solicitudSchema } from "@/lib/validations";
import { sendSolicitudRecibida } from "@/lib/email";
import { rateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const id = getRateLimitIdentifier(req);
    const rl = rateLimit(`solicitud:${id}`, 3, 60_000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Espere un momento." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = solicitudSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existing = await prisma.solicitud.findUnique({
      where: { ruc: data.ruc },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una solicitud con ese RUC" },
        { status: 409 }
      );
    }

    const solicitud = await prisma.solicitud.create({ data });

    try {
      await sendSolicitudRecibida(data.emailCorporativo, data.razonSocial);
    } catch (emailError) {
      console.error("Email error (non-critical):", emailError);
    }

    return NextResponse.json(
      { message: "Solicitud enviada correctamente", id: solicitud.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating solicitud:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
