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

    // Notificar al admin
    const adminEmail = process.env.ADMIN_EMAIL || "pekinglobalparts@gmail.com";
    try {
      const { getResend } = await import("@/lib/email");
      const resend = getResend();
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "Pekin Global Parts <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `Nueva solicitud de afiliación — ${data.razonSocial}`,
        html: `<p><strong>Nueva solicitud recibida:</strong></p>
        <ul>
          <li><strong>Empresa:</strong> ${data.razonSocial}</li>
          <li><strong>RUC:</strong> ${data.ruc}</li>
          <li><strong>Sector:</strong> ${data.sector}</li>
          <li><strong>Contacto:</strong> ${data.representanteLegal} (${data.cargo})</li>
          <li><strong>Email:</strong> ${data.emailCorporativo}</li>
          <li><strong>Teléfono:</strong> ${data.telefono}</li>
        </ul>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/solicitudes">Ver en el panel →</a></p>`,
      });
    } catch (adminEmailError) {
      console.error("Admin email error:", adminEmailError);
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
