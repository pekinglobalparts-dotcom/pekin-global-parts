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
  RECOMPRA: 20,
  CROSS_SELL: 45,
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

export type AccionTipo =
  | "COBRANZA" | "COTIZACION" | "REACTIVACION" | "BIENVENIDA" | "SOLICITUD"
  | "RECOMPRA" | "CROSS_SELL";

// Las tres primeras son "seguimiento"; RECOMPRA/CROSS_SELL/COTIZACION cuentan
// como oportunidades de venta (llevan montoPotencial).
export const TIPOS_OPORTUNIDAD: AccionTipo[] = ["RECOMPRA", "CROSS_SELL", "COTIZACION"];

export interface AccionSugerida {
  clave: string;
  tipo: AccionTipo;
  esOportunidad: boolean;
  montoPotencial: number | null; // S/ estimado de la venta en juego
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

const socioInclude = {
  cotizaciones: {
    select: {
      id: true, numero: true, status: true, total: true, createdAt: true,
      pedido: { select: { id: true } },
      items: { select: { cantidad: true, subtotal: true, producto: { select: { id: true, nombre: true } } } },
    },
  },
  pedidos: {
    select: {
      id: true, numero: true, total: true, status: true, createdAt: true,
      items: { select: { productoId: true, descripcion: true, cantidad: true, subtotal: true, producto: { select: { id: true, nombre: true } } } },
    },
  },
  facturas: { select: { id: true, numero: true, numeroReal: true, status: true, total: true, fechaVencimiento: true, pagadoAt: true, createdAt: true, ultimoRecordatorio: true } },
  solicitudesRepuesto: { select: { id: true, numero: true, descripcion: true, status: true, createdAt: true } },
} as const;

async function cargarSocios() {
  return prisma.socio.findMany({ include: socioInclude });
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

// Nombre y clave estable de un ítem comprado/cotizado: usa el producto ligado
// o, si fue texto libre, la descripción normalizada.
type ItemLike = { productoId?: string | null; descripcion?: string | null; cantidad: number; subtotal: unknown; producto?: { id: string; nombre: string } | null };
function itemKeyNombre(it: ItemLike): { key: string; nombre: string } {
  if (it.producto) return { key: "p:" + it.producto.id, nombre: it.producto.nombre };
  const d = (it.descripcion || "Repuesto").trim();
  return { key: "d:" + d.toLowerCase(), nombre: d || "Repuesto" };
}

interface ProdHist { nombre: string; fechas: number[]; ultimoSubtotal: number; }
// Historial de compra por producto de un socio (solo pedidos no cancelados).
function comprasPorProducto(s: SocioFull): Map<string, ProdHist> {
  const m = new Map<string, ProdHist>();
  for (const p of s.pedidos) {
    if (p.status === "CANCELADO") continue;
    const t = new Date(p.createdAt).getTime();
    for (const it of p.items) {
      const { key, nombre } = itemKeyNombre(it);
      const sub = Number(it.subtotal) || 0;
      const h = m.get(key);
      if (h) { h.fechas.push(t); h.ultimoSubtotal = sub; }
      else m.set(key, { nombre, fechas: [t], ultimoSubtotal: sub });
    }
  }
  return m;
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

  // Co-ocurrencia global: qué productos se compran juntos (para venta cruzada),
  // y precio promedio por producto (para estimar el monto potencial).
  const coocurre = new Map<string, Map<string, number>>();
  const nombreKey = new Map<string, string>();
  const montoProm = new Map<string, { sum: number; n: number }>();
  for (const s of socios) {
    for (const p of s.pedidos) {
      if (p.status === "CANCELADO") continue;
      const keys: string[] = [];
      for (const it of p.items) {
        const { key, nombre } = itemKeyNombre(it);
        keys.push(key);
        nombreKey.set(key, nombre);
        const mp = montoProm.get(key) || { sum: 0, n: 0 };
        mp.sum += Number(it.subtotal) || 0; mp.n += 1; montoProm.set(key, mp);
      }
      const uniq = [...new Set(keys)];
      for (const a of uniq) {
        let row = coocurre.get(a);
        if (!row) { row = new Map(); coocurre.set(a, row); }
        for (const b of uniq) if (a !== b) row.set(b, (row.get(b) || 0) + 1);
      }
    }
  }
  const montoPromDe = (key: string) => { const mp = montoProm.get(key); return mp && mp.n ? Math.round(mp.sum / mp.n) : null; };

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
          clave, tipo: "BIENVENIDA", esOportunidad: false, montoPotencial: null, prioridad: 2, icono: "🎉",
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
        clave, tipo: "COBRANZA", esOportunidad: false, montoPotencial: null, prioridad: vencida ? 1 : 2, icono: "💰",
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
        clave, tipo: "COTIZACION", esOportunidad: true, montoPotencial: c.total ? Number(c.total) : null, prioridad: 3, icono: "📋",
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
          clave, tipo: "REACTIVACION", esOportunidad: true, montoPotencial: ficha.totalPedidos ? Math.round(ficha.totalFacturado / ficha.totalPedidos) : null, prioridad: 4, icono: "😴",
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
        clave, tipo: "SOLICITUD", esOportunidad: true, montoPotencial: null, prioridad: 2, icono: "🔧",
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

    // 6) RECOMPRA: productos que el cliente compra con cierta frecuencia y ya
    // "tocan" de nuevo. Se sugiere a lo más 1 por cliente (el más atrasado).
    const hist = comprasPorProducto(s);
    let mejorRec: { nombre: string; cadencia: number; atraso: number; monto: number; key: string } | null = null;
    for (const [key, h] of hist) {
      if (h.fechas.length < 2) continue;
      const ord = [...h.fechas].sort((a, b) => a - b);
      const gaps: number[] = [];
      for (let i = 1; i < ord.length; i++) gaps.push((ord[i] - ord[i - 1]) / MS_DIA);
      const cadencia = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
      if (cadencia < 7 || cadencia > 365) continue; // cadencias poco fiables
      const diasDesde = Math.floor((Date.now() - ord[ord.length - 1]) / MS_DIA);
      if (diasDesde < cadencia * 0.85) continue; // aún no toca
      const atraso = diasDesde - cadencia;
      if (!mejorRec || atraso > mejorRec.atraso) mejorRec = { nombre: h.nombre, cadencia, atraso, monto: h.ultimoSubtotal, key };
    }
    if (mejorRec) {
      const clave = `recompra:${s.id}:${mejorRec.key}`;
      if (visible(clave, "RECOMPRA")) {
        const prod = mejorRec.nombre;
        const wsp = `Hola ${nombre}, le escribimos de Pekín Global Parts. Notamos que suele reponer ${prod} aproximadamente cada ${mejorRec.cadencia} días y ya va tocando. ¿Desea que le separemos stock? Le preparamos su cotización enseguida.`;
        acciones.push({
          clave, tipo: "RECOMPRA", esOportunidad: true, montoPotencial: mejorRec.monto || montoPromDe(mejorRec.key),
          prioridad: 2, icono: "🔁",
          titulo: `Recompra probable: ${prod} — ${nombre}`,
          detalle: `Lo repone cada ~${mejorRec.cadencia} días y ya pasaron ${mejorRec.cadencia + mejorRec.atraso}. Anticípate antes de que lo pida a otro.`,
          cliente: cli, canales: ["WHATSAPP", "EMAIL"], wa: waLink(s.telefono, wsp), mensajeWhatsApp: wsp,
          email: {
            asunto: `¿Reponemos su ${prod}?`,
            saludo: `Estimados ${nombre}`,
            parrafos: [
              `Notamos que suelen reponer <strong>${prod}</strong> cada cierto tiempo y ya va tocando.`,
              "¿Desean que les separemos stock? Les preparamos la cotización enseguida, al mejor precio.",
            ],
            cta: { label: "Pedir cotización", href: APP_URL },
          },
          ref: {},
        });
      }
    }

    // 7) VENTA CRUZADA: lo que compran clientes parecidos y este aún no compra.
    const comprados = new Set(hist.keys());
    if (comprados.size > 0) {
      const cand = new Map<string, number>();
      for (const key of comprados) {
        const row = coocurre.get(key);
        if (!row) continue;
        for (const [otro, n] of row) if (!comprados.has(otro)) cand.set(otro, (cand.get(otro) || 0) + n);
      }
      let mejor: { key: string; n: number } | null = null;
      for (const [key, n] of cand) if (!mejor || n > mejor.n) mejor = { key, n };
      if (mejor && mejor.n >= 2) {
        const clave = `cross:${s.id}:${mejor.key}`;
        if (visible(clave, "CROSS_SELL")) {
          const prod = nombreKey.get(mejor.key) || "un repuesto";
          const wsp = `Hola ${nombre}, le escribimos de Pekín Global Parts. Varios clientes del rubro que llevan lo mismo que usted también trabajan ${prod}. ¿Le preparo una cotización por si le interesa sumarlo a su próximo pedido?`;
          acciones.push({
            clave, tipo: "CROSS_SELL", esOportunidad: true, montoPotencial: montoPromDe(mejor.key),
            prioridad: 4, icono: "🧩",
            titulo: `Venta cruzada: ${prod} — ${nombre}`,
            detalle: `Clientes que compran lo mismo que ${nombre} también llevan ${prod}. Buena oportunidad de ampliar el ticket.`,
            cliente: cli, canales: ["WHATSAPP", "EMAIL"], wa: waLink(s.telefono, wsp), mensajeWhatsApp: wsp,
            email: {
              asunto: `Una recomendación para ${nombre}`,
              saludo: `Estimados ${nombre}`,
              parrafos: [
                `Clientes del rubro que trabajan lo mismo que ustedes también suelen llevar <strong>${prod}</strong>.`,
                "¿Les preparo una cotización por si les interesa sumarlo a su próximo pedido?",
              ],
              cta: { label: "Ver catálogo", href: APP_URL },
            },
            ref: {},
          });
        }
      }
    }
  }

  return acciones.sort((a, b) => a.prioridad - b.prioridad || (b.montoPotencial ?? 0) - (a.montoPotencial ?? 0) || a.titulo.localeCompare(b.titulo));
}

// ── Ficha 360 de un cliente ──
export interface ProductoAgg { nombre: string; cantidad: number; monto: number; veces: number }
export interface Ficha360 {
  cliente: ClienteCRM;
  compras: { id: string; numero: string; fecha: string; total: number; status: string; items: { nombre: string; cantidad: number; subtotal: number }[] }[];
  topComprados: ProductoAgg[];
  topCotizados: ProductoAgg[];
  conversion: { cotizaciones: number; convertidas: number; tasa: number };
  cotizacionesAbiertas: { numero: string; total: number | null; dias: number; status: string }[];
  facturas: { pagadas: number; pendientes: number; vencidas: number; porVencer: number; totalPagado: number; totalPorCobrar: number; diasPromedioPago: number | null };
  ticketPromedio: number | null;
  frecuenciaDias: number | null;
  proximaCompra: string | null;
}

export async function getFicha360(socioId: string): Promise<Ficha360 | null> {
  const s = await prisma.socio.findUnique({ where: { id: socioId }, include: socioInclude });
  if (!s) return null;
  const cliente = fichaCliente(s);
  const ahora = Date.now();

  const pedidosReales = s.pedidos.filter(p => p.status !== "CANCELADO");

  // Historial de compras (más reciente primero)
  const compras = [...pedidosReales]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 30)
    .map(p => ({
      id: p.id, numero: p.numero, fecha: new Date(p.createdAt).toISOString(),
      total: Number(p.total), status: p.status,
      items: p.items.map(it => ({ nombre: itemKeyNombre(it).nombre, cantidad: it.cantidad, subtotal: Number(it.subtotal) || 0 })),
    }));

  // Top comprados
  const aggC = new Map<string, ProductoAgg>();
  for (const p of pedidosReales) for (const it of p.items) {
    const { key, nombre } = itemKeyNombre(it);
    const a = aggC.get(key) || { nombre, cantidad: 0, monto: 0, veces: 0 };
    a.cantidad += it.cantidad; a.monto += Number(it.subtotal) || 0; a.veces += 1; aggC.set(key, a);
  }
  const topComprados = [...aggC.values()].sort((a, b) => b.monto - a.monto).slice(0, 6);

  // Top cotizados
  const aggQ = new Map<string, ProductoAgg>();
  for (const c of s.cotizaciones) for (const it of c.items) {
    const { key, nombre } = itemKeyNombre({ ...it, descripcion: null, productoId: it.producto?.id ?? null });
    const a = aggQ.get(key) || { nombre, cantidad: 0, monto: 0, veces: 0 };
    a.cantidad += it.cantidad; a.monto += Number(it.subtotal) || 0; a.veces += 1; aggQ.set(key, a);
  }
  const topCotizados = [...aggQ.values()].sort((a, b) => b.veces - a.veces || b.monto - a.monto).slice(0, 6);

  // Conversión cotización → pedido
  const totalCotiz = s.cotizaciones.length;
  const convertidas = s.cotizaciones.filter(c => c.pedido).length;
  const conversion = { cotizaciones: totalCotiz, convertidas, tasa: totalCotiz ? Math.round((convertidas / totalCotiz) * 100) : 0 };

  // Cotizaciones abiertas (sin pedido)
  const cotizacionesAbiertas = s.cotizaciones
    .filter(c => !c.pedido && c.status !== "RECHAZADA" && c.status !== "EXPIRADA")
    .map(c => ({ numero: c.numero, total: c.total ? Number(c.total) : null, dias: diasEntre(c.createdAt), status: c.status }))
    .sort((a, b) => b.dias - a.dias);

  // Facturas
  const fv = s.facturas.filter(f => f.status !== "ANULADA");
  const pagadas = fv.filter(f => f.status === "PAGADA");
  const porCobrar = fv.filter(f => f.status === "PENDIENTE" || f.status === "VENCIDA");
  const vencidas = porCobrar.filter(f => new Date(f.fechaVencimiento) < new Date());
  const diasPago = pagadas.filter(f => f.pagadoAt).map(f => (new Date(f.pagadoAt!).getTime() - new Date(f.createdAt).getTime()) / MS_DIA);
  const diasPromedioPago = diasPago.length ? Math.round(diasPago.reduce((a, b) => a + b, 0) / diasPago.length) : null;
  const facturas = {
    pagadas: pagadas.length, pendientes: porCobrar.length - vencidas.length, vencidas: vencidas.length,
    porVencer: porCobrar.filter(f => new Date(f.fechaVencimiento) >= new Date()).length,
    totalPagado: pagadas.reduce((a, f) => a + Number(f.total), 0),
    totalPorCobrar: porCobrar.reduce((a, f) => a + Number(f.total), 0),
    diasPromedioPago,
  };

  // Ticket, frecuencia y próxima compra estimada
  const ticketPromedio = pedidosReales.length ? Math.round(pedidosReales.reduce((a, p) => a + Number(p.total), 0) / pedidosReales.length) : null;
  const fechas = pedidosReales.map(p => new Date(p.createdAt).getTime()).sort((a, b) => a - b);
  let frecuenciaDias: number | null = null;
  let proximaCompra: string | null = null;
  if (fechas.length >= 2) {
    const gaps: number[] = [];
    for (let i = 1; i < fechas.length; i++) gaps.push((fechas[i] - fechas[i - 1]) / MS_DIA);
    frecuenciaDias = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    proximaCompra = new Date(fechas[fechas.length - 1] + frecuenciaDias * MS_DIA).toISOString();
  }
  void ahora;

  return { cliente, compras, topComprados, topCotizados, conversion, cotizacionesAbiertas, facturas, ticketPromedio, frecuenciaDias, proximaCompra };
}
