import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "Pekin Global Parts <noreply@pekin.com>";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: EmailOptions) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  });

  if (error) {
    console.error("Email error:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function sendSolicitudRecibida(
  email: string,
  razonSocial: string
) {
  return sendEmail({
    to: email,
    subject: "Solicitud de afiliación recibida - Pekin Global Parts",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e3a8a; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">PEKIN GLOBAL PARTS</h1>
          <p style="color: #93c5fd; margin: 4px 0 0;">Tu aliado en movimiento</p>
        </div>
        <div style="padding: 32px; background: #f8fafc;">
          <h2 style="color: #1e293b;">¡Solicitud recibida!</h2>
          <p style="color: #475569;">Estimado representante de <strong>${razonSocial}</strong>,</p>
          <p style="color: #475569;">Hemos recibido su solicitud de afiliación. Nuestro equipo la revisará en un plazo de 2 a 5 días hábiles.</p>
          <p style="color: #475569;">Le notificaremos por este medio el resultado de la evaluación.</p>
          <div style="background: white; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">¿Tiene alguna consulta? Contáctenos:</p>
            <p style="color: #1e3a8a; font-weight: bold; margin: 4px 0 0;">ventas@pekin.com.pe</p>
          </div>
          <p style="color: #94a3b8; font-size: 12px;">Pekin Global Parts S.A. | Lima, Perú</p>
        </div>
      </div>
    `,
  });
}

export async function sendSolicitudAprobada(
  email: string,
  razonSocial: string,
  password: string
) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`;
  return sendEmail({
    to: email,
    subject: "¡Bienvenido a Pekin Global Parts! - Cuenta activada",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e3a8a; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">PEKIN GLOBAL PARTS</h1>
          <p style="color: #93c5fd; margin: 4px 0 0;">Tu aliado en movimiento</p>
        </div>
        <div style="padding: 32px; background: #f8fafc;">
          <h2 style="color: #16a34a;">¡Solicitud aprobada!</h2>
          <p style="color: #475569;">Estimado representante de <strong>${razonSocial}</strong>,</p>
          <p style="color: #475569;">Nos complace informarle que su solicitud ha sido <strong>aprobada</strong>. Ya puede acceder a nuestro portal de socios.</p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 24px 0; border: 1px solid #e2e8f0;">
            <h3 style="color: #1e293b; margin-top: 0;">Sus credenciales de acceso</h3>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0;"><strong>Contraseña temporal:</strong> <code style="background: #f1f5f9; padding: 2px 8px; border-radius: 4px;">${password}</code></p>
            <p style="color: #f59e0b; font-size: 14px;">Por seguridad, cambie su contraseña al iniciar sesión por primera vez.</p>
          </div>
          <a href="${loginUrl}" style="display: inline-block; background: #1e3a8a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Ingresar al portal</a>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">Pekin Global Parts S.A. | Lima, Perú</p>
        </div>
      </div>
    `,
  });
}

export async function sendSolicitudRechazada(
  email: string,
  razonSocial: string,
  motivo: string
) {
  return sendEmail({
    to: email,
    subject: "Resultado de su solicitud - Pekin Global Parts",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e3a8a; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">PEKIN GLOBAL PARTS</h1>
          <p style="color: #93c5fd; margin: 4px 0 0;">Tu aliado en movimiento</p>
        </div>
        <div style="padding: 32px; background: #f8fafc;">
          <h2 style="color: #dc2626;">Solicitud no aprobada</h2>
          <p style="color: #475569;">Estimado representante de <strong>${razonSocial}</strong>,</p>
          <p style="color: #475569;">Lamentamos informarle que su solicitud no ha sido aprobada en esta oportunidad.</p>
          <div style="background: white; border-radius: 8px; padding: 16px; margin: 24px 0; border-left: 4px solid #dc2626;">
            <p style="color: #475569; margin: 0;"><strong>Motivo:</strong> ${motivo}</p>
          </div>
          <p style="color: #475569;">Si considera que hay un error, puede contactarnos para más información.</p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">Pekin Global Parts S.A. | Lima, Perú</p>
        </div>
      </div>
    `,
  });
}

export async function sendCotizacionRespondida(
  email: string,
  razonSocial: string,
  numeroCotizacion: string
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/socio/cotizaciones`;
  return sendEmail({
    to: email,
    subject: `Cotización ${numeroCotizacion} respondida - Pekin Global Parts`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e3a8a; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">PEKIN GLOBAL PARTS</h1>
        </div>
        <div style="padding: 32px; background: #f8fafc;">
          <h2 style="color: #1e293b;">Cotización respondida</h2>
          <p style="color: #475569;">Estimado representante de <strong>${razonSocial}</strong>,</p>
          <p style="color: #475569;">Su cotización <strong>${numeroCotizacion}</strong> ha sido respondida. Ingrese al portal para ver el detalle.</p>
          <a href="${url}" style="display: inline-block; background: #1e3a8a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Ver cotización</a>
        </div>
      </div>
    `,
  });
}

export async function sendPedidoEnviado(
  email: string,
  razonSocial: string,
  numeroPedido: string
) {
  return sendEmail({
    to: email,
    subject: `Pedido ${numeroPedido} enviado - Pekin Global Parts`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e3a8a; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">PEKIN GLOBAL PARTS</h1>
        </div>
        <div style="padding: 32px; background: #f8fafc;">
          <h2 style="color: #1e293b;">¡Su pedido está en camino!</h2>
          <p style="color: #475569;">Estimado representante de <strong>${razonSocial}</strong>,</p>
          <p style="color: #475569;">Su pedido <strong>${numeroPedido}</strong> ha sido despachado. Pronto llegará a su destino.</p>
        </div>
      </div>
    `,
  });
}
