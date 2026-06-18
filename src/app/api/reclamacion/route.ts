import { NextRequest, NextResponse } from "next/server";
import { getResend } from "@/lib/email";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "pekinglobalparts@gmail.com";

export async function POST(req: NextRequest) {
  const { nombre, dni, email, tipo, descripcion } = await req.json();

  if (!nombre || !dni || !email || !descripcion) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const tipoLabel = tipo === "queja" ? "Queja" : tipo === "reclamo" ? "Reclamo" : "Sugerencia";

  try {
    const resend = getResend();
    await resend.emails.send({
      from: `Pekín Global Parts <${ADMIN_EMAIL}>`,
      to: [ADMIN_EMAIL],
      replyTo: email,
      subject: `📋 Libro de Reclamaciones - ${tipoLabel} de ${nombre}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <div style="background:#e8121a;padding:16px 24px;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;font-size:20px;">📋 Nueva ${tipoLabel}</h1>
            <p style="color:#ffcccc;margin:4px 0 0;font-size:13px;">Libro de Reclamaciones · Pekín Global Parts SAC</p>
          </div>
          <div style="background:#f8f8f8;padding:24px;border-radius:0 0 12px 12px;border:1px solid #eee;border-top:none;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#666;font-size:13px;width:140px;">Nombre</td><td style="padding:8px 0;font-weight:bold;color:#111;">${nombre}</td></tr>
              <tr><td style="padding:8px 0;color:#666;font-size:13px;">DNI / RUC</td><td style="padding:8px 0;font-weight:bold;color:#111;">${dni}</td></tr>
              <tr><td style="padding:8px 0;color:#666;font-size:13px;">Email</td><td style="padding:8px 0;font-weight:bold;color:#111;">${email}</td></tr>
              <tr><td style="padding:8px 0;color:#666;font-size:13px;">Tipo</td><td style="padding:8px 0;"><span style="background:#fef3c7;color:#92400e;padding:2px 10px;border-radius:99px;font-size:12px;font-weight:bold;">${tipoLabel}</span></td></tr>
            </table>
            <div style="margin-top:16px;padding:16px;background:white;border-radius:8px;border:1px solid #eee;">
              <p style="color:#666;font-size:12px;margin:0 0 8px;font-weight:bold;text-transform:uppercase;letter-spacing:0.05em;">Descripción</p>
              <p style="color:#111;font-size:14px;line-height:1.6;margin:0;">${descripcion.replace(/\n/g, "<br/>")}</p>
            </div>
            <p style="color:#999;font-size:11px;margin-top:16px;text-align:center;">Debes responder al reclamante en un plazo máximo de 30 días calendario según el Código de Protección al Consumidor.</p>
          </div>
        </div>
      `,
    });

    // Confirmation to user
    await resend.emails.send({
      from: `Pekín Global Parts <${ADMIN_EMAIL}>`,
      to: [email],
      subject: `✅ Reclamación recibida - Pekín Global Parts`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <div style="background:#0f1f3d;padding:16px 24px;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;font-size:20px;">Reclamación registrada</h1>
          </div>
          <div style="padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
            <p>Hola <strong>${nombre}</strong>,</p>
            <p>Hemos recibido tu ${tipoLabel.toLowerCase()} correctamente. Te responderemos en un plazo máximo de 48 horas hábiles.</p>
            <p style="color:#666;font-size:13px;">— Equipo Pekín Global Parts SAC</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("[reclamacion]", err);
  }

  return NextResponse.json({ ok: true });
}
