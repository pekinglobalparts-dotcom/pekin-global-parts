"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, DollarSign, Percent, Wallet, Trophy, Plus, AlertTriangle, Receipt, PiggyBank, Landmark, ShoppingBag, ListChecks } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Operacion { fecha: string; tipo: string; ref: string; venta: number; costo: number; ganancia: number; sinCosto: boolean }

interface Finanzas {
  mes: { ventas: number; costo: number; ganancia: number; margen: number; gastos: number; utilidadNeta: number; impuestoEstimado: number; pedidosSinCosto: number };
  cobros: { porCobrar: number; cobradoMes: number };
  gastosPorCategoria: Record<string, number>;
  operaciones: Operacion[];
  serie: { mes: string; ventas: number; ganancia: number }[];
  topProductos: { nombre: string; cantidad: number; venta: number }[];
}

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const mesLabel = (m: string) => {
  const [, mm] = m.split("-");
  return MESES[parseInt(mm) - 1] || m;
};

export default function FinanzasPage() {
  const [data, setData] = useState<Finanzas | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/finanzas")
      .then(r => {
        if (r.status === 401) { setDenied(true); return null; }
        return r.json();
      })
      .then(d => { if (d) setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (denied) {
    return (
      <div className="p-8 text-center text-slate-500">
        <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-amber-400" />
        <p className="font-semibold text-slate-700">Acceso restringido</p>
        <p className="text-sm">Esta sección es solo para el Super Administrador.</p>
      </div>
    );
  }

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-400 text-sm">Cargando…</div>;
  }

  const maxSerie = Math.max(1, ...data.serie.map(s => Math.max(s.ventas, s.ganancia)));

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Finanzas</h1>
          <p className="text-slate-500 text-sm mt-0.5">Control del negocio · montos reales (lo que cobras y lo que pagas)</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Link
            href="/admin/gastos"
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Receipt className="h-4 w-4" /> Registrar gasto
          </Link>
          <Link
            href="/admin/ventas"
            className="flex items-center gap-2 bg-[#0f1f3d] hover:bg-[#16294f] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="h-4 w-4" /> Registrar venta
          </Link>
        </div>
      </div>

      {/* KPIs del mes */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><TrendingUp className="h-4 w-4" /> Ventas</div>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(data.mes.ventas)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><ShoppingBag className="h-4 w-4" /> Costo (compras)</div>
          <p className="text-2xl font-black text-slate-500">{formatCurrency(data.mes.costo)}</p>
        </div>
        <div className="bg-white border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-emerald-600 text-xs mb-1"><DollarSign className="h-4 w-4" /> Ganancia</div>
          <p className="text-2xl font-black text-emerald-700">{formatCurrency(data.mes.ganancia)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><Percent className="h-4 w-4" /> Margen</div>
          <p className="text-2xl font-black text-slate-900">{data.mes.margen.toFixed(1)}%</p>
        </div>
        <div className="bg-white border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-amber-600 text-xs mb-1"><Wallet className="h-4 w-4" /> Por cobrar</div>
          <p className="text-2xl font-black text-amber-700">{formatCurrency(data.cobros.porCobrar)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Cobrado: {formatCurrency(data.cobros.cobradoMes)}</p>
        </div>
      </div>

      <p className="text-xs text-slate-400 -mt-2">Ventas − Costo (compras) = Ganancia. Todo en montos reales (lo que cobras y lo que pagas).</p>

      {data.mes.pedidosSinCosto > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Hay <b>{data.mes.pedidosSinCosto}</b> venta(s) de socios este mes sin costo registrado — su ganancia no se está contando. Registra el costo en el pedido para verla reflejada.</span>
        </div>
      )}

      {/* Resultado del mes: ganancia − gastos = utilidad neta */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2"><PiggyBank className="h-4 w-4 text-emerald-600" /> Resultado del mes</h2>
        <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap text-center">
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Ganancia (repuestos)</p>
            <p className="text-xl font-black text-emerald-700">{formatCurrency(data.mes.ganancia)}</p>
          </div>
          <span className="text-2xl text-slate-300 font-light">−</span>
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Gastos</p>
            <p className="text-xl font-black text-slate-500">{formatCurrency(data.mes.gastos)}</p>
          </div>
          <span className="text-2xl text-slate-300 font-light">=</span>
          <div className={`px-4 py-2 rounded-xl ${data.mes.utilidadNeta >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Utilidad neta</p>
            <p className={`text-2xl font-black ${data.mes.utilidadNeta >= 0 ? "text-emerald-700" : "text-red-600"}`}>{formatCurrency(data.mes.utilidadNeta)}</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-500">
          <Landmark className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
          <span>
            <b>Recordatorio SUNAT (RER 1.5%):</b> por tus ventas de este mes deberías declarar aprox.
            <b className="text-blue-700"> {formatCurrency(data.mes.impuestoEstimado)}</b>. Cuando lo pagues, regístralo como gasto en la categoría <b>Impuestos</b> para que se descuente de tu utilidad.
          </span>
        </div>
      </div>

      {/* Detalle de operaciones del mes */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
          <ListChecks className="h-4 w-4 text-[#0f1f3d]" /> Detalle de operaciones del mes
        </h2>
        <p className="text-[11px] text-slate-400 mb-4">Cada venta con su costo y ganancia. El &quot;Costo (compras)&quot; de arriba es la suma del costo de lo vendido aquí — no incluye stock que compraste pero aún no vendes (eso va en Gastos → Compra de stock).</p>
        {data.operaciones.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No hay operaciones este mes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-[11px] text-slate-400 uppercase border-b border-slate-100">
                  <th className="py-2 pr-2 font-semibold">Fecha</th>
                  <th className="py-2 px-2 font-semibold">Cliente / Ref.</th>
                  <th className="py-2 px-2 font-semibold">Tipo</th>
                  <th className="py-2 px-2 font-semibold text-right">Venta</th>
                  <th className="py-2 px-2 font-semibold text-right">Costo</th>
                  <th className="py-2 pl-2 font-semibold text-right">Ganancia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.operaciones.map((o, i) => {
                  const margen = o.venta > 0 && !o.sinCosto ? (o.ganancia / o.venta) * 100 : 0;
                  return (
                    <tr key={i}>
                      <td className="py-2 pr-2 text-slate-500 whitespace-nowrap">{formatDate(o.fecha)}</td>
                      <td className="py-2 px-2 text-slate-800 truncate max-w-[160px]">{o.ref}</td>
                      <td className="py-2 px-2">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${o.tipo === "Socio" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>{o.tipo}</span>
                      </td>
                      <td className="py-2 px-2 text-right font-semibold text-slate-900">{formatCurrency(o.venta)}</td>
                      <td className="py-2 px-2 text-right text-slate-500">{o.sinCosto ? <span className="text-amber-500 text-xs">sin costo</span> : formatCurrency(o.costo)}</td>
                      <td className="py-2 pl-2 text-right font-bold text-emerald-700">
                        {o.sinCosto ? "—" : <>{formatCurrency(o.ganancia)} <span className="text-[10px] text-slate-400 font-normal">({margen.toFixed(0)}%)</span></>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-100 font-black">
                  <td className="py-2 pr-2 text-slate-500 text-xs uppercase" colSpan={3}>Total del mes</td>
                  <td className="py-2 px-2 text-right text-slate-900">{formatCurrency(data.mes.ventas)}</td>
                  <td className="py-2 px-2 text-right text-slate-500">{formatCurrency(data.mes.costo)}</td>
                  <td className="py-2 pl-2 text-right text-emerald-700">{formatCurrency(data.mes.ganancia)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Gráfico 6 meses */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900 text-sm">Ventas y ganancia · últimos 6 meses</h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#0f1f3d]" /> Ventas</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> Ganancia</span>
          </div>
        </div>
        <div className="flex items-end justify-between gap-3 h-48">
          {data.serie.map(s => (
            <div key={s.mes} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div className="flex items-end gap-1 h-full w-full justify-center">
                <div
                  className="w-1/2 max-w-[26px] bg-[#0f1f3d] rounded-t"
                  style={{ height: `${(s.ventas / maxSerie) * 100}%` }}
                  title={`Ventas: ${formatCurrency(s.ventas)}`}
                />
                <div
                  className="w-1/2 max-w-[26px] bg-emerald-500 rounded-t"
                  style={{ height: `${(s.ganancia / maxSerie) * 100}%` }}
                  title={`Ganancia: ${formatCurrency(s.ganancia)}`}
                />
              </div>
              <span className="text-[11px] text-slate-400 font-medium">{mesLabel(s.mes)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top productos */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
          <Trophy className="h-4 w-4 text-amber-500" /> Productos más vendidos
        </h2>
        {data.topProductos.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Aún no hay ventas registradas para mostrar el ranking.</p>
        ) : (
          <div className="space-y-2">
            {data.topProductos.map((p, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="flex-1 text-sm text-slate-800 truncate">{p.nombre}</span>
                <span className="text-xs text-slate-400 shrink-0">{p.cantidad} und</span>
                <span className="text-sm font-bold text-slate-700 shrink-0 w-24 text-right">{formatCurrency(p.venta)}</span>
              </div>
            ))}
          </div>
        )}
        <p className="text-[11px] text-slate-400 mt-3">Ordenado por cantidad vendida — útil para decidir qué comprar para stock según demanda.</p>
      </div>
    </div>
  );
}
