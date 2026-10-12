// Motor del CRM automatizado.
// Toda la información se calcula en vivo a partir de los datos que el sistema
// ya tiene (socios, cotizaciones, pedidos, facturas, solicitudes de repuesto).
// No hay carga manual: aquí se arman (1) la ficha de cada cliente con sus
// métricas y (2) las acciones sugeridas con el mensaje ya redactado.
import { prisma } from "@/lib/prisma";

const MS_DIA = 1000 * 60 * 60 * 24;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://socios.pekinglobalparts.com";

// Umbrales (días)
export const DIAS_RIESGO = 45;
export const DIAS_DORMIDO = 90;
const DIAS_COTIZACION = 3;   // cotización sin avanzar
const DIAS_SOLICITUD = 2;    // solicitud de repuesto sin respuesta
const DIAS_PORVENCER = 3;    // factura próxima a vencer

// Cooldown por tipo: cada cuántos días se puede volver a sugerir tras enviarla.
const COOLDOWN: Record<string, number> = {
  COBRANZA: 5,
  COTIZACION: 7,
  SOLICITUD: 7,
  REACTIVACION: 30,
  BIENVENIDA: 3650, // una sola vez en la práctica
};

export type Temperatura = "NUEVO" | "ACTIVO" | "RIESGO" | "DORMIDO";

export interface ClienteCRM {
  id: string;
  razonSocial: string;
  telefono: string;
  email: string;
  sector: string;
  ciudad: string | null;
  status: string;
  lineaCredito: number;
  creditoUtilizado: number;
  totalPedidos: number;
  totalFacturado: number;
  montoPorCobrar: number;
  cotizacionesPendientes: number;
  facturasVencidas: number;
  ultimaCompra: string | null;
  diasSinComprar: number | null;
  temperatura: Temperatura;
  wa: string | null;
}

export type CanalCRM = "WHATSAPP" | "EMAIL";

export interface AccionSugerida {
  clave: string;
  tipo: "COBRANZA" | "COTIZACION" | "REACTIVACION" | "BIENVENIDA" | "SOLICITUD";
  prioridad: number; // 1 = más urgente
  icono: string;
  titulo: string;
  detalle: string;
  cliente: { id: string; nombre: string; telefono: string; email: string };
  canales: CanalCRM[];
  wa: string | null;            // link wa.me listo (con texto)
  mensajeWhatsApp: string;      // texto crudo (por si se quiere copiar)
  email: { asunto: string; saludo: string; parrafos: string[]; cta?: { label: string; href: string } } | null;
  // referencia para el envío por correo desde el servidor
  ref: { facturaId?: string };
}

// ── Helpers ──
export function waDigits(tel: string | null | undefined): string | null {
  if (!tel) return null;
  let d = String(tel).replace(/\D/g, "");
  if (!d) return null;
  if (d.length === 9) d = "51" + d;      // celular Perú sin código
  if (d.length === 7 || d.length === 8) return null; // fijo sin sentido para WhatsApp
  return d;
}
export function waLink(tel: string | null | undefined, texto: string): string | null {
  const d = waDigits(tel);
  if (!d) return null;
  return `https://wa.me/${d}?text=${encodeURIComponent(texto)}`;
}
const money = (n: number) => `S/ ${Number(n).toFixed(2)}`;
const diasEntre = (d: Date) => Math.floor((Date.now() - new Date(d).getTime()) / MS_DIA);

type SocioFull = Awaited<ReturnType<typeof cargarSocios>>[number];

async function cargarSocios() {
  return prisma.socio.findMany({
    include: {
      cotizaciones: { select: { id: true, numero: true, status: true, total: true, createdAt: true, pedido: { select: { id: true } } } },
      pedidos: { select: { id: true, total: true, status: true, createdAt: true } },
      facturas: { select: { id: true, numero: true, numeroReal: true, status: true, total: true, fechaVencimiento: true, ultimoRecordatorio: true } },
      solicitudesRepuesto: { select: { id: true, numero: true, descripcion: true, status: true, createdAt: true } },
    },
  });
}

function temperaturaDe(diasSinComprar: number | null, creadoDias: number, haComprado: boolean): Temperatura {
  if (!haComprado) return creadoDias <= 30 ? "NUEVO" : "DORMIDO";
  if (diasSinComprar === null) return "DORMIDO";
  if (diasSinComprar <= DIAS_RIESGO) return "ACTIVO";
  if (diasSinComprar <= DIAS_DORMIDO) return "RIESGO";
  return "DORMIDO";
}

function fichaCliente(s: SocioFull): ClienteCRM {
  const pedidosReales = s.pedidos.filter(p => p.status !== "CANCELADO");
  const facturasVivas = s.facturas.filter(f => f.status !== "ANULADA");
  const porCobrar = facturasVivas.filter(f => f.status === "PENDIENTE" || f.status === "VENCIDA");
  const vencidas = porCobrar.filter(f => new Date(f.fechaVencimiento) < new Date());
  const cotizPend = s.cotizaciones.filter(c => (c.status === "PENDIENTE" || c.status === "ENVIADA") && !c.pedido);

  const fechasCompra = pedidosReales.map(p => new Date(p.createdAt).getTime());
  const ultima = fechasCompra.length ? new Date(Math.max(...fechasCompra)) : null;
  const totalFacturado = facturasVivas.reduce((a, f) => a + Number(f.total), 0);

  return {
    id: s.id,
    razonSocial: s.razonSocial,
    telefono: s.telefono,
    email: s.emailCorporativo,
    sector: s.sector,
    ciudad: s.ciudad,
    status: s.status,
    lineaCredito: Number(s.lineaCredito),
    creditoUtilizado: Number(s.creditoUtilizado),
    totalPedidos: pedidosReales.length,
    totalFacturado,
    montoPorCobrar: porCobrar.reduce((a, f) => a + Number(f.total), 0),
    cotizacionesPendientes: cotizPend.length,
    facturasVencidas: vencidas.length,
    ultimaCompra: ultima ? ultima.toISOString() : null,
    diasSinComprar: ultima ? diasEntre(ultima) : null,
    temperatura: temperaturaDe(ultima ? diasEntre(ultima) : null, diasEntre(s.createdAt), pedidosReales.length > 0),
    wa: waDigits(s.telefono),
  };
}

export async function getClientes(): Promise<ClienteCRM[]> {
  const socios = await cargarSocios();
  const fichas = socios.map(fichaCliente);
  // Orden: primero los que requieren atención (por cobrar / dormidos), luego por total.
  const peso = (c: ClienteCRM) => (c.facturasVencidas > 0 ? 3 : 0) + (c.temperatura === "DORMIDO" ? 2 : c.temperatura === "RIESGO" ? 1 : 0);
  return fichas.sort((a, b) => peso(b) - peso(a) || b.totalFacturado - a.totalFacturado);
}

// ── Motor de acciones ──
export async function getAcciones(): Promise<AccionSugerida[]> {
  const socios = await cargarSocios();
  const estados = await prisma.accionCRM.findMany();
  const estadoPorClave = new Map(estados.map(e => [e.clave, e]));
  const ahora = new Date();

  // ¿Debe mostrarse una acción con esta clave/tipo?
  const visible = (clave: string, tipo: string) => {
    const e = estadoPorClave.get(clave);
    if (!e) return true;
    if (e.estado === "DESCARTADA") return false;
    if (e.estado === "POSPUESTA") return !e.snoozeHasta || new Date(e.snoozeHasta) <= ahora;
    if (e.estado === "ENVIADA") {
      const dias = COOLDOWN[tipo] ?? 9999;
      return diasEntre(e.updatedAt) >= dias;
    }
    return true;
  };

  const acciones: AccionSugerida[] = [];

  for (const s of socios) {
    const nombre = s.razonSocial;
    const cli = { id: s.id, nombre, telefono: s.telefono, email: s.emailCorporativo };

    // 1) Bienvenida a socios nuevos (aprobados en los últimos 7 días)
    if (diasEntre(s.createdAt) <= 7) {
      const clave = `bienvenida:${s.id}`;
      if (visible(clave, "BIENVENIDA")) {
        const wsp = `Hola ${nombre}, ¡bienvenidos a Pekín Global Parts! 🎉 Ya pueden acceder a su portal de socios en ${APP_URL} para cotizar y ver sus pedidos. Cualquier repuesto que necesiten, con gusto los ayudamos.`;
        acciones.push({
          clave, tipo: "BIENVENIDA", prioridad: 2, icono: "🎉",
          titulo: `Dar la bienvenida a ${nombre}`,
          detalle: `Socio nuevo (registrado hace ${diasEntre(s.createdAt)} día(s)). Un saludo de bienvenida afianza la relación.`,
          cliente: cli, canales: ["WHATSAPP", "EMAIL"], wa: waLink(s.telefono, wsp), mensajeWhatsApp: wsp,
          email: {
            asunto: "¡Bienvenidos a Pekín Global Parts!",
            saludo: `¡Bienvenidos, ${nombre}!`,
            parrafos: [
              "Nos alegra tenerlos como socios. Desde ahora cuentan con un portal donde pueden cotizar repuestos, hacer pedidos y llevar el control de sus compras y crédito.",
              `Pueden ingresar en <a href="${APP_URL}" style="color:#dc2626;">${APP_URL}</a>. Cualquier repuesto que necesiten, estamos para ayudarlos.`,
            ],
            cta: { label: "Ir al portal de socios", href: APP_URL },
          },
          ref: {},
        });
      }
    }

    // 2) Cobranza: facturas por cobrar (vencidas o próximas a vencer)
    for (const f of s.facturas) {
      if (f.status === "PAGADA" || f.status === "ANULADA") continue;
      const venc = new Date(f.fechaVencimiento);
      const dias = Math.ceil((venc.getTime() - ahora.getTime()) / MS_DIA); // <0 vencida
      const vencida = dias < 0;
      if (!vencida && dias > DIAS_PORVENCER) continue; // aún lejos
      const clave = `cobranza:${f.id}`;
      if (!visible(clave, "COBRANZA")) continue;
      const nro = f.numeroReal || f.numero;
      const estadoTxt = vencida ? `vencida hace ${Math.abs(dias)} día(s)` : dias === 0 ? "vence hoy" : `vence en ${dias} día(s)`;
      const wsp = `Hola ${nombre}, le escribimos de Pekín Global Parts. Le recordamos que su factura ${nro} por ${money(Number(f.total))} ${estadoTxt}. Agradeceremos su pago. Cualquier consulta, con gusto le ayudamos.`;
      acciones.push({
        clave, tipo: "COBRANZA", prioridad: vencida ? 1 : 2, icono: "💰",
        titulo: `Cobranza: factura ${nro} de ${nombre}`,
        detalle: `${money(Number(f.total))} · ${estadoTxt}.${f.ultimoRecordatorio ? ` Último recordatorio: ${new Date(f.ultimoRecordatorio).toLocaleDateString("es-PE")}.` : ""}`,
        cliente: cli, canales: ["WHATSAPP", "EMAIL"], wa: waLink(s.telefono, wsp), mensajeWhatsApp: wsp,
        email: null, // el correo de cobranza se envía con la plantilla oficial (ver route)
        ref: { facturaId: f.id },
      });
    }

    // 3) Seguimiento de cotizaciones sin avanzar
    for (const c of s.cotizaciones) {
      if ((c.status !== "PENDIENTE" && c.status !== "ENVIADA") || c.pedido) continue;
      const dias = diasEntre(c.createdAt);
      if (dias < DIAS_COTIZACION) continue;
      const clave = `cotiz:${c.id}`;
      if (!visible(clave, "COTIZACION")) continue;
      const montoTxt = c.total ? ` por ${money(Number(c.total))}` : "";
      const wsp = `Hola ${nombre}, le escribimos de Pekín Global Parts para hacer seguimiento a su cotización ${c.numero}${montoTxt}. ¿Desea que avancemos con el pedido o tiene alguna consulta? Estamos para ayudarlo.`;
      acciones.push({
        clave, tipo: "COTIZACION", prioridad: 3, icono: "📋",
        titulo: `Seguir cotización ${c.numero} de ${nombre}`,
        detalle: `Enviada hace ${dias} día(s)${montoTxt ? ` · ${money(Number(c.total))}` : ""}. Sin pedido aún — un seguimiento sube la conversión.`,
        cliente: cli, canales: ["WHATSAPP", "EMAIL"], wa: waLink(s.telefono, wsp), mensajeWhatsApp: wsp,
        email: {
          asunto: `Seguimiento a su cotización ${c.numero}`,
          saludo: `Estimados ${nombre}`,
          parrafos: [
            `Queremos hacer seguimiento a la cotización <strong>${c.numero}</strong>${montoTxt} que les enviamos.`,
            "¿Desean que avancemos con el pedido o tienen alguna consulta sobre precios o disponibilidad? Con gusto los ayudamos.",
          ],
          cta: { label: "Ver mi cotización", href: `${APP_URL}` },
        },
        ref: {},
      });
    }

    // 4) Reactivación: clientes que compraban y llevan +90 días sin comprar
    const ficha = fichaCliente(s);
    if (ficha.temperatura === "DORMIDO" && ficha.totalPedidos > 0 && ficha.diasSinComprar !== null) {
      const periodo = `${ahora.getFullYear()}-${ahora.getMonth() + 1}`;
      const clave = `react:${s.id}:${periodo}`;
      if (visible(clave, "REACTIVACION")) {
        const wsp = `Hola ${nombre}, ¡cuánto tiempo! Le saludamos de Pekín Global Parts. Tenemos stock fresco y buenos precios en repuestos. ¿Hay algo que estén necesitando? Con gusto les preparamos una cotización.`;
        acciones.push({
          clave, tipo: "REACTIVACION", prioridad: 4, icono: "😴",
          titulo: `Reactivar a ${nombre}`,
          detalle: `Cliente sin comprar hace ${ficha.diasSinComprar} día(s). Ha facturado ${money(ficha.totalFacturado)} en total — vale la pena recuperarlo.`,
          cliente: cli, canales: ["WHATSAPP", "EMAIL"], wa: waLink(s.telefono, wsp), mensajeWhatsApp: wsp,
          email: {
            asunto: "Los extrañamos en Pekín Global Parts",
            saludo: `Estimados ${nombre}`,
            parrafos: [
              "Hace un tiempo que no hacen un pedido con nosotros y queríamos saludarlos. Seguimos con stock fresco y buenos precios en repuestos.",
              "¿Hay algo que estén necesitando? Con gusto les preparamos una cotización sin compromiso.",
            ],
            cta: { label: "Pedir una cotización", href: APP_URL },
          },
          ref: {},
        });
      }
    }

    // 5) Solicitudes de repuesto pendientes de respuesta
    for (const sr of s.solicitudesRepuesto) {
      if (sr.status !== "PENDIENTE" && sr.status !== "EN_PROCESO") continue;
      const dias = diasEntre(sr.createdAt);
      if (dias < DIAS_SOLICITUD) continue;
      const clave = `solrep:${sr.id}`;
      if (!visible(clave, "SOLICITUD")) continue;
      const desc = sr.descripcion.length > 60 ? sr.descripcion.slice(0, 57) + "…" : sr.descripcion;
      const wsp = `Hola ${nombre}, le escribimos de Pekín Global Parts sobre su solicitud ${sr.numero} (${desc}). Ya la estamos gestionando y en breve le damos una respuesta con disponibilidad y precio. ¡Gracias por su paciencia!`;
      acciones.push({
        clave, tipo: "SOLICITUD", prioridad: 2, icono: "🔧",
        titulo: `Responder solicitud ${sr.numero} de ${nombre}`,
        detalle: `"${desc}" · pendiente hace ${dias} día(s). Un aviso de avance mantiene la confianza.`,
        cliente: cli, canales: ["WHATSAPP", "EMAIL"], wa: waLink(s.telefono, wsp), mensajeWhatsApp: wsp,
        email: {
          asunto: `Su solicitud de repuesto ${sr.numero}`,
          saludo: `Estimados ${nombre}`,
          parrafos: [
            `Les escribimos respecto a su solicitud <strong>${sr.numero}</strong> (${desc}).`,
            "Ya la estamos gestionando y en breve les daremos una respuesta con disponibilidad y precio. Agradecemos su paciencia.",
          ],
        },
        ref: {},
      });
    }
  }

  return acciones.sort((a, b) => a.prioridad - b.prioridad || a.titulo.localeCompare(b.titulo));
}
