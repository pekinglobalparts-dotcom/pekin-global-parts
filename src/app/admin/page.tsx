import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FileText, Users, Package, ShoppingCart, Receipt, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

async function getStats() {
  const [
    totalSocios,
    solicitudesPendientes,
    totalProductos,
    cotizacionesPendientes,
    pedidosActivos,
    facturasPendientes,
  ] = await Promise.all([
    prisma.socio.count({ where: { status: "ACTIVO" } }),
    prisma.solicitud.count({ where: { status: "PENDIENTE" } }),
    prisma.producto.count({ where: { activo: true } }),
    prisma.cotizacion.count({ where: { status: "PENDIENTE" } }),
    prisma.pedido.count({
      where: { status: { in: ["PENDIENTE", "CONFIRMADO", "EN_PROCESO"] } },
    }),
    prisma.factura.count({ where: { status: "PENDIENTE" } }),
  ]);

  const solicitudesRecientes = await prisma.solicitud.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return {
    totalSocios,
    solicitudesPendientes,
    totalProductos,
    cotizacionesPendientes,
    pedidosActivos,
    facturasPendientes,
    solicitudesRecientes,
  };
}

const statCards = (s: Awaited<ReturnType<typeof getStats>>) => [
  { label: "Socios activos", value: s.totalSocios, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Solicitudes pendientes", value: s.solicitudesPendientes, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Productos activos", value: s.totalProductos, icon: Package, color: "text-green-600", bg: "bg-green-50" },
  { label: "Cotizaciones pendientes", value: s.cotizacionesPendientes, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Pedidos activos", value: s.pedidosActivos, icon: ShoppingCart, color: "text-orange-600", bg: "bg-orange-50" },
  { label: "Facturas pendientes", value: s.facturasPendientes, icon: Receipt, color: "text-red-600", bg: "bg-red-50" },
];

export default async function AdminDashboard() {
  const session = await auth();
  const stats = await getStats();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">
          Bienvenido, {session?.user.name?.split(" ")[0]}
        </h1>
        <p className="text-slate-500 mt-1">Panel de administración · Pekin Global Parts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {statCards(stats).map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`${card.bg} rounded-xl p-3`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{card.value}</div>
                <div className="text-sm text-slate-500">{card.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Solicitudes recientes</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {stats.solicitudesRecientes.length === 0 ? (
              <p className="p-6 text-slate-400 text-sm">Sin solicitudes recientes</p>
            ) : (
              stats.solicitudesRecientes.map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{s.razonSocial}</p>
                    <p className="text-xs text-slate-400">{s.ruc} · {s.sector}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
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
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Acciones rápidas</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-3">
            {[
              { href: "/admin/solicitudes", label: "Revisar solicitudes", icon: FileText },
              { href: "/admin/socios", label: "Gestionar socios", icon: Users },
              { href: "/admin/productos", label: "Agregar producto", icon: Package },
              { href: "/admin/cotizaciones", label: "Cotizaciones", icon: ShoppingCart },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex flex-col items-center gap-2 p-4 border border-slate-200 rounded-xl hover:border-blue-900 hover:bg-blue-50 transition-colors text-center"
              >
                <action.icon className="h-6 w-6 text-blue-900" />
                <span className="text-xs font-medium text-slate-700">{action.label}</span>
              </a>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
