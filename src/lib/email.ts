import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM || "Pekin Global Parts <noreply@pekinglobalparts.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51953096242";

export function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

async function sendEmail(to: string | string[], subject: string, html: string) {
  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  });
  if (error) {
    console.error("[email]", error);
    throw new Error(error.message);
  }
  return data;
}

/* ──────────────────────────── LAYOUT ──────────────────────────── */

function layout(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- HEADER -->
      <tr><td style="background:#0f1f3d;border-radius:12px 12px 0 0;padding:28px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="background:#dc2626;width:36px;height:36px;border-radius:8px;display:inline-block;text-align:center;line-height:36px;">
                  <span style="color:white;font-weight:900;font-size:14px;">PK</span>
                </div>
                <span style="color:white;font-size:20px;font-weight:900;letter-spacing:-0.5px;margin-left:10px;">PEKIN GLOBAL PARTS</span>
              </div>
              <p style="color:#93c5fd;margin:4px 0 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Tu aliado en movimiento</p>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- BODY -->
      <tr><td style="background:white;padding:40px;">
        ${body}
      </td></tr>

      <!-- FOOTER -->
      <tr><td style="background:#0f1f3d;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
        <p style="color:#93c5fd;font-size:12px;margin:0 0 8px;">
          <a href="https://wa.me/${WHATSAPP}" style="color:#4ade80;text-decoration:none;">WhatsApp: +${WHATSAPP}</a>
          &nbsp;·&nbsp;
          <a href="mailto:pekinglobalparts@gmail.com" style="color:#93c5fd;text-decoration:none;">pekinglobalparts@gmail.com</a>
        </p>
        <p style="color:#475569;font-size:11px;margin:0;">Pekin Global Parts S.A.C. · Lima, Perú</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}

function badge(text: string, color: string, bg: string) {
  return `<span style="display:inline-block;background:${bg};color:${color};font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:0.5px;">${text}</span>`;
}

function ctaButton(label: string, href: string, color = "#0f1f3d") {
  return `<a href="${href}" style="display:inline-block;background:${color};color:white;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin-top:8px;">${label} →</a>`;
}

function infoRow(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 0;color:#64748b;font-size:14px;width:160px;">${label}</td>
    <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:600;">${value}</td>
  </tr>`;
}

function divider() {
  return `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">`;
}

/* ──────────────────────── PUBLIC EMAILS ──────────────────────── */

export async function sendSolicitudRecibida(email: string, razonSocial: string) {
  const html = layout("Solicitud recibida - Pekin Global Parts", `
    <h2 style="color:#0f1f3d;font-size:22px;font-weight:900;margin:0 0 8px;">¡Solicitud recibida!</h2>
    <p style="color:#475569;font-size:15px;margin:0 0 24px;">Estimado representante de <strong>${razonSocial}</strong>, hemos recibido su solicitud de afiliación.</p>

    <div style="background:#f0f9ff;border-left:4px solid #0f1f3d;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
      <p style="color:#1e293b;font-size:14px;margin:0;"><strong>¿Qué sigue?</strong></p>
      <p style="color:#475569;font-size:14px;margin:8px 0 0;">Nuestro equipo comercial revisará su perfil en un plazo de <strong>2 a 5 días hábiles</strong> y le notificaremos el resultado por este correo.</p>
    </div>

    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
      ${infoRow("Empresa", razonSocial)}
      ${infoRow("Email de contacto", email)}
      ${infoRow("Estado", badge("PENDIENTE DE REVISIÓN", "#92400e", "#fef3c7"))}
    </table>

    ${divider()}
    <p style="color:#64748b;font-size:13px;">¿Tiene alguna consulta inmediata? Escríbanos por WhatsApp.</p>
    ${ctaButton("Consultar por WhatsApp", `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola, hice una solicitud de afiliación para ${razonSocial} y quisiera consultar el estado.`)}`, "#16a34a")}
  `);
  return sendEmail(email, "Solicitud de afiliación recibida — Pekin Global Parts", html);
}

export async function sendSolicitudAprobada(email: string, razonSocial: string, password: string) {
  const loginUrl = `${APP_URL}/login`;
  const html = layout("¡Bienvenido a Pekin Global Parts!", `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:#dcfce7;border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">✓</span>
      </div>
      <h2 style="color:#15803d;font-size:24px;font-weight:900;margin:0 0 8px;">¡Solicitud aprobada!</h2>
      <p style="color:#475569;font-size:15px;margin:0;">Ya es parte de la red de socios de Pekin Global Parts</p>
    </div>

    <p style="color:#475569;font-size:15px;margin:0 0 24px;">Estimado representante de <strong>${razonSocial}</strong>, nos complace darle la bienvenida. A continuación encontrará sus credenciales de acceso al portal exclusivo para socios.</p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:24px;">
      <h3 style="color:#1e293b;font-size:16px;font-weight:700;margin:0 0 16px;">🔑 Sus credenciales de acceso</h3>
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        ${infoRow("Usuario (email)", email)}
        ${infoRow("Contraseña temporal", `<code style="background:#f1f5f9;padding:3px 10px;border-radius:6px;font-size:15px;font-weight:700;letter-spacing:1px;color:#0f1f3d;">${password}</code>`)}
      </table>
      <p style="color:#dc2626;font-size:12px;margin:16px 0 0;">⚠️ Por seguridad, cambie esta contraseña al ingresar por primera vez en Mi Perfil.</p>
    </div>

    <h3 style="color:#1e293b;font-size:15px;font-weight:700;margin:0 0 12px;">¿Qué puede hacer en el portal?</h3>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
      <tr>
        <td style="padding:6px 8px;font-size:14px;color:#475569;">📦</td>
        <td style="padding:6px 0;font-size:14px;color:#475569;">Explorar el catálogo completo con precios</td>
      </tr>
      <tr>
        <td style="padding:6px 8px;font-size:14px;color:#475569;">📋</td>
        <td style="padding:6px 0;font-size:14px;color:#475569;">Solicitar y gestionar cotizaciones</td>
      </tr>
      <tr>
        <td style="padding:6px 8px;font-size:14px;color:#475569;">🚚</td>
        <td style="padding:6px 0;font-size:14px;color:#475569;">Seguir sus pedidos en tiempo real</td>
      </tr>
      <tr>
        <td style="padding:6px 8px;font-size:14px;color:#475569;">💳</td>
        <td style="padding:6px 0;font-size:14px;color:#475569;">Gestionar su línea de crédito</td>
      </tr>
    </table>

    ${ctaButton("Ingresar al portal de socios", loginUrl)}
  `);
  return sendEmail(email, "¡Bienvenido a Pekin Global Parts! Cuenta activada", html);
}

export async function sendSolicitudRechazada(email: string, razonSocial: string, motivo: string) {
  const html = layout("Resultado de su solicitud — Pekin Global Parts", `
    <h2 style="color:#1e293b;font-size:22px;font-weight:900;margin:0 0 8px;">Resultado de su solicitud</h2>
    <p style="color:#475569;font-size:15px;margin:0 0 24px;">Estimado representante de <strong>${razonSocial}</strong>,</p>
    <p style="color:#475569;font-size:15px;margin:0 0 24px;">Luego de evaluar su solicitud de afiliación, lamentamos comunicarle que en esta oportunidad no es posible aprobarla.</p>

    <div style="background:#fff5f5;border-left:4px solid #dc2626;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
      <p style="color:#991b1b;font-size:14px;font-weight:700;margin:0 0 6px;">Motivo de la decisión:</p>
      <p style="color:#7f1d1d;font-size:14px;margin:0;">${motivo}</p>
    </div>

    <p style="color:#475569;font-size:14px;">Si considera que hay información adicional que podría cambiar esta decisión, o desea consultar más detalles, no dude en contactarnos.</p>
    ${divider()}
    ${ctaButton("Consultar por WhatsApp", `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola, mi solicitud de ${razonSocial} fue rechazada y quisiera consultar los detalles.`)}`, "#16a34a")}
  `);
  return sendEmail(email, "Resultado de su solicitud — Pekin Global Parts", html);
}

/* ──────────────────────── COTIZACIONES ──────────────────────── */

export async function sendCotizacionRespondida(
  email: string,
  razonSocial: string,
  numeroCotizacion: string,
  total?: number
) {
  const url = `${APP_URL}/socio/cotizaciones`;
  const html = layout(`Cotización ${numeroCotizacion} respondida`, `
    <h2 style="color:#0f1f3d;font-size:22px;font-weight:900;margin:0 0 8px;">Su cotización fue respondida</h2>
    <p style="color:#475569;font-size:15px;margin:0 0 24px;">Estimado representante de <strong>${razonSocial}</strong>, su solicitud de cotización ya tiene respuesta de nuestro equipo comercial.</p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        ${infoRow("N° Cotización", numeroCotizacion)}
        ${infoRow("Estado", badge("RESPONDIDA", "#14532d", "#dcfce7"))}
        ${total ? infoRow("Total cotizado", `<strong style="color:#0f1f3d;font-size:18px;">S/ ${total.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</strong>`) : ""}
      </table>
    </div>

    <p style="color:#475569;font-size:14px;margin:0 0 20px;">Ingrese al portal para revisar el detalle de precios y <strong>aceptar o rechazar</strong> la cotización. Si acepta, se generará su pedido automáticamente.</p>

    ${ctaButton("Ver cotización y decidir", url)}
    <span style="display:inline-block;width:12px;"></span>
    ${ctaButton("Consultar por WhatsApp", `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola, tengo consultas sobre mi cotización ${numeroCotizacion}.`)}`, "#16a34a")}
  `);
  return sendEmail(email, `Cotización ${numeroCotizacion} respondida — Pekin Global Parts`, html);
}

/* ──────────────────────── PEDIDOS ──────────────────────── */

export async function sendPedidoConfirmado(
  email: string,
  razonSocial: string,
  numeroPedido: string,
  total: number
) {
  const url = `${APP_URL}/socio/pedidos`;
  const html = layout(`Pedido ${numeroPedido} confirmado`, `
    <h2 style="color:#0f1f3d;font-size:22px;font-weight:900;margin:0 0 8px;">¡Pedido confirmado!</h2>
    <p style="color:#475569;font-size:15px;margin:0 0 24px;">Estimado representante de <strong>${razonSocial}</strong>, hemos confirmado su pedido y ya está en preparación.</p>

    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        ${infoRow("N° Pedido", numeroPedido)}
        ${infoRow("Estado", badge("CONFIRMADO", "#1e40af", "#dbeafe"))}
        ${infoRow("Total", `<strong style="color:#0f1f3d;font-size:18px;">S/ ${total.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</strong>`)}
      </table>
    </div>

    <p style="color:#475569;font-size:14px;margin:0 0 20px;">Le notificaremos por este mismo correo cuando su pedido sea enviado con información de seguimiento.</p>
    ${ctaButton("Seguir mi pedido", url)}
  `);
  return sendEmail(email, `Pedido ${numeroPedido} confirmado — Pekin Global Parts`, html);
}

export async function sendPedidoEnviado(
  email: string,
  razonSocial: string,
  numeroPedido: string,
  direccion?: string | null
) {
  const url = `${APP_URL}/socio/pedidos`;
  const html = layout(`Pedido ${numeroPedido} en camino`, `
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:48px;">🚚</span>
      <h2 style="color:#15803d;font-size:24px;font-weight:900;margin:12px 0 8px;">¡Su pedido está en camino!</h2>
      <p style="color:#475569;font-size:15px;margin:0;">Estimado representante de <strong>${razonSocial}</strong></p>
    </div>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        ${infoRow("N° Pedido", numeroPedido)}
        ${infoRow("Estado", badge("ENVIADO", "#14532d", "#dcfce7"))}
        ${direccion ? infoRow("Dirección de entrega", direccion) : ""}
      </table>
    </div>

    <p style="color:#475569;font-size:14px;margin:0 0 20px;">Puede seguir el estado de su entrega en el portal. Si tiene alguna consulta sobre la entrega, contáctenos directamente.</p>

    ${ctaButton("Ver estado del pedido", url)}
    <span style="display:inline-block;width:12px;"></span>
    ${ctaButton("Contactar por WhatsApp", `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola, consulto sobre el envío de mi pedido ${numeroPedido}.`)}`, "#16a34a")}
  `);
  return sendEmail(email, `Pedido ${numeroPedido} enviado — Pekin Global Parts`, html);
}

export async function sendPedidoEntregado(
  email: string,
  razonSocial: string,
  numeroPedido: string
) {
  const html = layout(`Pedido ${numeroPedido} entregado`, `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:#dcfce7;border-radius:50%;margin:0 auto 16px;line-height:64px;font-size:28px;">✓</div>
      <h2 style="color:#15803d;font-size:24px;font-weight:900;margin:0 0 8px;">¡Pedido entregado!</h2>
      <p style="color:#475569;font-size:15px;margin:0;">Gracias por confiar en Pekin Global Parts</p>
    </div>

    <p style="color:#475569;font-size:15px;margin:0 0 24px;">Estimado representante de <strong>${razonSocial}</strong>, confirmamos que su pedido <strong>${numeroPedido}</strong> fue entregado satisfactoriamente.</p>

    <div style="background:#fafafa;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:24px;text-align:center;">
      <p style="color:#475569;font-size:14px;margin:0 0 12px;">¿Tuvo algún inconveniente con su pedido?</p>
      ${ctaButton("Contáctenos", `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola, tengo un comentario sobre mi pedido ${numeroPedido}.`)}`, "#16a34a")}
    </div>

    <p style="color:#94a3b8;font-size:13px;text-align:center;">Puede solicitar nuevas cotizaciones desde el portal en cualquier momento.</p>
  `);
  return sendEmail(email, `Pedido ${numeroPedido} entregado — Pekin Global Parts`, html);
}

/* ──────────────────────── FACTURAS ──────────────────────── */

export async function sendFacturaEmitida(
  email: string,
  razonSocial: string,
  numeroFactura: string,
  total: number,
  vencimiento: string
) {
  const url = `${APP_URL}/socio/facturas`;
  const html = layout(`Factura ${numeroFactura} emitida`, `
    <h2 style="color:#0f1f3d;font-size:22px;font-weight:900;margin:0 0 8px;">Nueva factura emitida</h2>
    <p style="color:#475569;font-size:15px;margin:0 0 24px;">Estimado representante de <strong>${razonSocial}</strong>, le informamos que se ha emitido una nueva factura a su nombre.</p>

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        ${infoRow("N° Factura", numeroFactura)}
        ${infoRow("Total a pagar", `<strong style="color:#0f1f3d;font-size:20px;">S/ ${total.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</strong>`)}
        ${infoRow("Fecha de vencimiento", `<strong style="color:#dc2626;">${vencimiento}</strong>`)}
        ${infoRow("Estado", badge("PENDIENTE DE PAGO", "#92400e", "#fef3c7"))}
      </table>
    </div>

    <p style="color:#475569;font-size:14px;margin:0 0 20px;">Para procesar su pago o consultar los datos bancarios, contáctenos por WhatsApp o ingrese al portal.</p>

    ${ctaButton("Ver mis facturas", url)}
    <span style="display:inline-block;width:12px;"></span>
    ${ctaButton("Coordinar pago por WhatsApp", `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola, deseo coordinar el pago de mi factura ${numeroFactura} por S/ ${total.toFixed(2)}.`)}`, "#16a34a")}
  `);
  return sendEmail(email, `Factura ${numeroFactura} — Pekin Global Parts`, html);
}


/* ──────────────────────── DOCUMENTOS CRÉDITO ──────────────────────── */

export async function sendSolicitudDocumentos(
  email: string,
  razonSocial: string,
  uploadUrl: string
) {
  const docs = [
    "DNI del representante legal (ambas caras)",
    "Ficha RUC actualizada (SUNAT)",
    "Estados financieros o declaración de renta (último año)",
    "Referencias comerciales (opcional)",
  ];

  const html = layout("Solicitud de documentos para línea de crédito", `
    <h2 style="color:#0f1f3d;font-size:22px;font-weight:900;margin:0 0 8px;">Documentos requeridos</h2>
    <p style="color:#475569;font-size:15px;margin:0 0 20px;">
      Estimado representante de <strong>${razonSocial}</strong>, hemos revisado su solicitud y estamos
      evaluando otorgarle una línea de crédito. Para continuar, necesitamos los siguientes documentos:
    </p>

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="color:#92400e;font-weight:700;font-size:13px;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;">Documentos requeridos</p>
      <ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;line-height:2;">
        ${docs.map(d => `<li>${d}</li>`).join("")}
      </ul>
    </div>

    <p style="color:#475569;font-size:14px;margin:0 0 20px;">
      Suba sus documentos usando el botón a continuación. El enlace es personal y válido para esta solicitud.
    </p>

    ${ctaButton("Subir documentos", uploadUrl, "#0f1f3d")}

    <p style="color:#94a3b8;font-size:12px;margin-top:24px;">
      Si tiene dudas, contáctenos por WhatsApp y le ayudamos con el proceso.
    </p>
  `);

  return sendEmail(email, "Documentos requeridos para su línea de crédito — Pekin Global Parts", html);
}

export async function sendDocumentosRecibidos(
  adminEmail: string,
  razonSocial: string,
  ruc: string,
  adminUrl: string
) {
  const html = layout("Documentos recibidos", `
    <h2 style="color:#0f1f3d;font-size:22px;font-weight:900;margin:0 0 8px;">Documentos subidos</h2>
    <p style="color:#475569;font-size:15px;margin:0 0 20px;">
      <strong>${razonSocial}</strong> (RUC: ${ruc}) ha subido sus documentos para evaluación de crédito.
    </p>
    ${ctaButton("Revisar documentos", adminUrl, "#0f1f3d")}
  `);

  return sendEmail(adminEmail, `Documentos de ${razonSocial} listos para revisión`, html);
}
