import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, ShoppingCart, Receipt, FileText, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function SocioDashboard() {
  const session = await auth();
  if (!session) return null;

  const socio = await prisma.socio.findUnique({
    where: { id: session.user.id },
  });

  if (!socio) return <div className="p-8 text-slate-500">Perfil no encontrado</div>;

  const [pedidosActivos, facturasPendientes, cotizacionesPendientes, notificaciones] =
    await Promise.all([
      prisma.pedido.count({
        where: { socioId: socio.id, status: { in: ["PENDIENTE", "CONFIRMADO", "EN_PROCESO", "ENVIADO"] } },
      }),
      prisma.factura.count({ where: { socioId: socio.id, status: "PENDIENTE" } }),
      prisma.cotizacion.count({ where: { socioId: socio.id, status: "PENDIENTE" } }),
      prisma.notificacion.findMany({
        where: { socioId: socio.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const tipoPago = (socio as unknown as { tipoPago?: string }).tipoPago ?? "CREDITO";
  const plazoCredito = (socio as unknown as { plazoCredito?: number }).plazoCredito ?? 30;
  const lineaCredito = Number(socio.lineaCredito);
  const creditoUtilizado = Number(socio.creditoUtilizado);
  const creditoDisponible = lineaCredito - creditoUtilizado;
  const usagePercent = lineaCredito > 0
    ? (creditoUtilizado / lineaCredito) * 100
    : 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">
          Bienvenido, {socio.razonSocial}
        </h1>
        <p className="text-slate-500 mt-1">RUC: {socio.ruc} · {socio.sector.replace(/_/g, " ")}</p>
      </div>

      {/* Credit / Contado card */}
      {tipoPago === "CREDITO" ? (
        <div className="bg-gradient-to-r from-blue-950 to-blue-900 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-200 text-sm">Línea de crédito disponible · Plazo {plazoCredito} días</p>
              <p className="text-4xl font-black mt-1">{formatCurrency(creditoDisponible)}</p>
            </div>
            <CreditCard className="h-10 w-10 text-blue-300" />
          </div>
          <div className="h-2 bg-white/20 rounded-full mb-2">
            <div className="h-2 bg-white rounded-full transition-all" style={{ width: `${Math.min(usagePercent, 100)}%` }} />
          </div>
          <div className="flex justify-between text-sm text-blue-200">
            <span>Utilizado: {formatCurrency(creditoUtilizado)}</span>
            <span>Total: {formatCurrency(lineaCredito)}</span>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-semibold uppercase tracking-wide">Cuenta al contado</p>
              <p className="text-lg font-bold mt-1">Pago por transferencia o link antes del despacho</p>
              <p className="text-green-100 text-sm mt-2">Sus pedidos se confirman al verificar el pago. Contáctenos por WhatsApp para coordinar.</p>
            </div>
            <CreditCard className="h-10 w-10 text-green-200 shrink-0" />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Pedidos activos", value: pedidosActivos, icon: ShoppingCart, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Facturas pendientes", value: facturasPendientes, icon: Receipt, color: "text-red-600", bg: "bg-red-50" },
          { label: "Cotizaciones", value: cotizacionesPendientes, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`${s.bg} rounded-xl p-3`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <Bell className="h-4 w-4 text-slate-400" />
            <h2 className="font-bold text-slate-900">Notificaciones</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {notificaciones.length === 0 ? (
              <p className="p-5 text-sm text-slate-400">Sin notificaciones</p>
            ) : (
              notificaciones.map((n) => (
                <div key={n.id} className={`p-4 ${!n.leida ? "bg-blue-50/50" : ""}`}>
                  <p className="text-sm font-medium text-slate-900">{n.titulo}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.mensaje}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatDate(n.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick actions */}
        <Card>
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Acciones rápidas</h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            {[
              { href: "/socio/catalogo", label: "Ver catálogo", icon: "📦" },
              { href: "/socio/cotizaciones", label: "Nueva cotización", icon: "📋" },
              { href: "/socio/pedidos", label: "Mis pedidos", icon: "🚚" },
              { href: "/socio/facturas", label: "Mis facturas", icon: "🧾" },
            ].map((a) => (
              <a
                key={a.href}
                href={a.href}
                className="flex flex-col items-center gap-2 p-4 border border-slate-200 rounded-xl hover:border-blue-900 hover:bg-blue-50 transition-colors text-center"
              >
                <span className="text-2xl">{a.icon}</span>
                <span className="text-xs font-medium text-slate-700">{a.label}</span>
              </a>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
