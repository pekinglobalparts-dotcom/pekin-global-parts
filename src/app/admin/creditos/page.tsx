"use client";

import { useState, useEffect, useCallback } from "react";
import { CreditCard, Search, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SocioCredito {
  id: string;
  razonSocial: string;
  ruc: string;
  sector: string;
  status: string;
  lineaCredito: number;
  creditoUtilizado: number;
  _count: { pedidos: number };
}

interface Movimiento {
  id: string;
  tipo: string;
  monto: number;
  concepto: string;
  createdAt: string;
  socio: { razonSocial: string };
}

export default function AdminCreditosPage() {
  const [socios, setSocios] = useState<SocioCredito[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"lineas" | "movimientos">("lineas");

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const [sociosRes, movRes] = await Promise.all([
      fetch(`/api/admin/socios?status=ACTIVO${search ? `&search=${search}` : ""}`),
      fetch("/api/admin/creditos/movimientos"),
    ]);
    const sociosData = await sociosRes.json();
    const movData = await movRes.json();
    setSocios(sociosData.socios || []);
    setMovimientos(movData.movimientos || []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetch_, 300);
    return () => clearTimeout(t);
  }, [fetch_]);

  const pct = (s: SocioCredito) =>
    Number(s.lineaCredito) > 0
      ? Math.min((Number(s.creditoUtilizado) / Number(s.lineaCredito)) * 100, 100)
      : 0;

  const totalLineas = socios.reduce((sum, s) => sum + Number(s.lineaCredito), 0);
  const totalUtilizado = socios.reduce((sum, s) => sum + Number(s.creditoUtilizado), 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Créditos</h1>
        <p className="text-slate-500 text-sm mt-0.5">Líneas de crédito y movimientos de socios activos</p>
      </div>

      {!loading && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-xs text-slate-400 mb-1">Total líneas otorgadas</p>
            <p className="text-2xl font-black text-slate-900">{formatCurrency(totalLineas)}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-xs text-slate-400 mb-1">Total utilizado</p>
            <p className="text-2xl font-black text-blue-900">{formatCurrency(totalUtilizado)}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-xs text-slate-400 mb-1">Disponible total</p>
            <p className="text-2xl font-black text-green-700">{formatCurrency(totalLineas - totalUtilizado)}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
        {(["lineas", "movimientos"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "lineas" ? "Líneas de crédito" : "Movimientos"}
          </button>
        ))}
      </div>

      {tab === "lineas" && (
        <>
          <div className="relative mb-4 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar socio..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">Cargando...</div>
            ) : socios.length === 0 ? (
              <div className="p-12 text-center">
                <CreditCard className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No hay socios activos</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Empresa</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Línea total</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Utilizado</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-48">Uso</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Disponible</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {socios.map(s => {
                      const p = pct(s);
                      const disponible = Number(s.lineaCredito) - Number(s.creditoUtilizado);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-900 text-sm">{s.razonSocial}</div>
                            <div className="text-xs text-slate-400">{s.ruc}</div>
                          </td>
                          <td className="px-5 py-4 text-sm font-bold text-slate-700">{formatCurrency(s.lineaCredito)}</td>
                          <td className="px-5 py-4 text-sm text-slate-600">{formatCurrency(s.creditoUtilizado)}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    p >= 90 ? "bg-red-500" : p >= 70 ? "bg-amber-500" : "bg-blue-900"
                                  }`}
                                  style={{ width: `${p}%` }}
                                />
                              </div>
                              <span className={`text-xs font-bold w-10 text-right ${
                                p >= 90 ? "text-red-600" : p >= 70 ? "text-amber-600" : "text-slate-600"
                              }`}>{Math.round(p)}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-sm font-bold ${disponible < 0 ? "text-red-600" : "text-green-700"}`}>
                              {formatCurrency(disponible)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {tab === "movimientos" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Cargando...</div>
          ) : movimientos.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="h-12 w-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No hay movimientos registrados</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {movimientos.map(m => (
                <div key={m.id} className="flex items-center gap-4 p-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    m.tipo === "CARGO" ? "bg-red-50" : m.tipo === "ABONO" ? "bg-green-50" : "bg-slate-50"
                  }`}>
                    {m.tipo === "CARGO" ? (
                      <TrendingUp className="h-4 w-4 text-red-600" />
                    ) : m.tipo === "ABONO" ? (
                      <TrendingDown className="h-4 w-4 text-green-600" />
                    ) : (
                      <Minus className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{m.socio.razonSocial}</p>
                    <p className="text-xs text-slate-400">{m.concepto} · {formatDate(m.createdAt)}</p>
                  </div>
                  <span className={`text-sm font-bold shrink-0 ${
                    m.tipo === "CARGO" ? "text-red-600" : m.tipo === "ABONO" ? "text-green-700" : "text-slate-600"
                  }`}>
                    {m.tipo === "CARGO" ? "+" : m.tipo === "ABONO" ? "-" : ""}{formatCurrency(m.monto)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
