import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import {
  FileText, Users, Package, ShoppingCart, Receipt,
  AlertCircle, TrendingUp, DollarSign, Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AdminCharts } from "@/components/admin/AdminCharts";

async function getStats() {
  const [
    totalSocios,
    solicitudesPendientes,
    totalProductos,
    cotizacionesPendientes,
    pedidosActivos,
    facturasPendientes,
    solicitudesRecientes,
    totalFacturado,
    totalPendienteCobro,
  ] = await Promise.all([
    prisma.socio.count({ where: { status: "ACTIVO" } }),
    prisma.solicitud.count({ where: { status: "PENDIENTE" } }),
    prisma.producto.count({ where: { activo: true } }),
    prisma.cotizacion.count({ where: { status: "PENDIENTE" } }),
    prisma.pedido.count({
      where: { status: { in: ["PENDIENTE", "CONFIRMADO", "EN_PROCESO"] } },
    }),
    prisma.factura.count({ where: { status: "PENDIENTE" } }),
    prisma.solicitud.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.factura.aggregate({
      _sum: { total: true },
      where: { status: { in: ["PENDIENTE", "PAGADA"] } },
    }),
    prisma.factura.aggregate({
      _sum: { total: true },
      where: { status: "PENDIENTE" },
    }),
  ]);

  return {
    totalSocios, solicitudesPendientes, totalProductos,
    cotizacionesPendientes, pedidosActivos, facturasPendientes,
    solicitudesRecientes,
    totalFacturado: Number(totalFacturado._sum.total || 0),
    totalPendienteCobro: Number(totalPendienteCobro._sum.total || 0),
  };
}

export default async function AdminDashboard() {
  const session = await auth();
  const stats = await getStats();

  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-slate-400 text-sm">{saludo}</p>
        <h1 className="text-2xl font-black text-slate-900 mt-0.5">
          {session?.user.name?.split(" ")[0]}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Resumen general de Pekin Global Parts
        </p>
      </div>

      {/* Metric cards - fila 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          {
            label: "Socios activos",
            value: stats.totalSocios,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
            trend: null,
          },
          {
            label: "Solicitudes pendientes",
            value: stats.solicitudesPendientes,
            icon: AlertCircle,
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-100",
            href: "/admin/solicitudes",
            urgent: stats.solicitudesPendientes > 0,
          },
          {
            label: "Cotizaciones",
            value: stats.cotizacionesPendientes,
            icon: FileText,
            color: "text-purple-600",
            bg: "bg-purple-50",
            border: "border-purple-100",
            href: "/admin/cotizaciones",
          },
          {
            label: "Pedidos activos",
            value: stats.pedidosActivos,
            icon: ShoppingCart,
            color: "text-orange-600",
            bg: "bg-orange-50",
            border: "border-orange-100",
            href: "/admin/pedidos",
          },
        ].map((card) => (
          <a key={card.label} href={(card as { href?: string }).href || "#"}>
            <Card className={`border ${card.border} hover:shadow-md transition-all ${(card as { urgent?: boolean }).urgent ? "ring-2 ring-amber-400" : ""}`}>
              <CardContent className="p-5">
                <div className={`${card.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <p className="text-3xl font-black text-slate-900">{card.value}</p>
                <p className="text-xs text-slate-500 mt-1">{card.label}</p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      {/* Financial row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <a href="/admin/facturas">
          <Card className="border border-green-100 hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="bg-green-50 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{formatCurrency(stats.totalFacturado)}</p>
              <p className="text-xs text-slate-500 mt-1">Total facturado</p>
            </CardContent>
          </Card>
        </a>
        <a href="/admin/facturas?status=PENDIENTE">
          <Card className={`border hover:shadow-md transition-all ${stats.totalPendienteCobro > 0 ? "border-red-100" : "border-slate-100"}`}>
            <CardContent className="p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stats.totalPendienteCobro > 0 ? "bg-red-50" : "bg-slate-50"}`}>
                <Clock className={`h-5 w-5 ${stats.totalPendienteCobro > 0 ? "text-red-600" : "text-slate-400"}`} />
              </div>
              <p className="text-2xl font-black text-slate-900">{formatCurrency(stats.totalPendienteCobro)}</p>
              <p className="text-xs text-slate-500 mt-1">Pendiente de cobro</p>
            </CardContent>
          </Card>
        </a>
        <Card className="border border-slate-100">
          <CardContent className="p-5">
            <div className="bg-slate-50 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
              <Package className="h-5 w-5 text-slate-500" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.totalProductos}</p>
            <p className="text-xs text-slate-500 mt-1">Productos en catálogo</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts + recent */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2">
          <AdminCharts />
        </div>

        {/* Recent solicitudes */}
        <Card>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">Últimas solicitudes</h2>
            <a href="/admin/solicitudes" className="text-xs text-red-600 hover:text-red-700 font-medium">
              Ver todas →
            </a>
          </div>
          <div className="divide-y divide-slate-50">
            {stats.solicitudesRecientes.length === 0 ? (
              <p className="p-5 text-slate-400 text-sm text-center">Sin solicitudes</p>
            ) : (
              stats.solicitudesRecientes.map((s) => (
                <a
                  key={s.id}
                  href="/admin/solicitudes"
                  className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs shrink-0 mt-0.5">
                    {s.razonSocial[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-xs truncate">{s.razonSocial}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.sector.replace(/_/g, " ")}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${
                      s.status === "PENDIENTE"
                        ? "bg-amber-100 text-amber-700"
                        : s.status === "APROBADA"
                        ? "bg-green-100 text-green-700"
                        : s.status === "RECHAZADA"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {s.status}
                  </span>
                </a>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
