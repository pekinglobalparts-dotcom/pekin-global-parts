"use client";

import { useState, useEffect, useCallback } from "react";
import { CreditCard, Search, TrendingUp, TrendingDown, Minus, Scale, X, Check } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

// El crédito baja (verde) con un pago o liberación; sube (rojo) con un consumo.
const movStyle = (tipo: string): { signo: string; color: string; bg: string; up: boolean } => {
  if (tipo === "PAGO_RECIBIDO" || tipo === "CREDITO_LIBERADO") return { signo: "-", color: "text-green-700", bg: "bg-green-50", up: false };
  if (tipo === "CREDITO_UTILIZADO") return { signo: "+", color: "text-red-600", bg: "bg-red-50", up: true };
  return { signo: "", color: "text-slate-600", bg: "bg-slate-50", up: true }; // CREDITO_ASIGNADO u otros
};

interface Plan {
  socioId: string;
  razonSocial: string;
  lineaCredito: number;
  utilizadoActual: number;
  utilizadoCorrecto: number;
  diferencia: number;
  pagosFaltantes: { facturaId: string; numero: string; total: number; fecha: string }[];
}

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
  descripcion: string;
  createdAt: string;
  socio: { razonSocial: string };
}

export default function AdminCreditosPage() {
  const [socios, setSocios] = useState<SocioCredito[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"lineas" | "movimientos">("lineas");

  // Reconciliación de saldos
  const [reconOpen, setReconOpen] = useState(false);
  const [reconPlanes, setReconPlanes] = useState<Plan[] | null>(null);
  const [reconLoading, setReconLoading] = useState(false);
  const [reconApplying, setReconApplying] = useState(false);
  const [reconError, setReconError] = useState("");
  const [reconResult, setReconResult] = useState<{ sociosAjustados: number; pagosRegistrados: number } | null>(null);

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

  const abrirRecon = async () => {
    setReconOpen(true); setReconLoading(true); setReconError(""); setReconResult(null); setReconPlanes(null);
    try {
      const r = await fetch("/api/admin/creditos/reconciliar");
      if (r.status === 401) { setReconError("Esta acción es solo para el Super Administrador."); setReconLoading(false); return; }
      const d = await r.json();
      setReconPlanes(d.planes || []);
    } catch { setReconError("No se pudo cargar la vista previa."); }
    setReconLoading(false);
  };

  const aplicarRecon = async () => {
    setReconApplying(true); setReconError("");
    try {
      const r = await fetch("/api/admin/creditos/reconciliar", { method: "POST" });
      if (!r.ok) { const d = await r.json().catch(() => ({})); setReconError(d.error || "No se pudo aplicar."); setReconApplying(false); return; }
      const d = await r.json();
      setReconResult({ sociosAjustados: d.sociosAjustados, pagosRegistrados: d.pagosRegistrados });
      fetch_();
    } catch { setReconError("Error de conexión."); }
    setReconApplying(false);
  };

  const pct = (s: SocioCredito) =>
    Number(s.lineaCredito) > 0
      ? Math.min((Number(s.creditoUtilizado) / Number(s.lineaCredito)) * 100, 100)
      : 0;

  const totalLineas = socios.reduce((sum, s) => sum + Number(s.lineaCredito), 0);
  const totalUtilizado = socios.reduce((sum, s) => sum + Number(s.creditoUtilizado), 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Créditos</h1>
          <p className="text-slate-500 text-sm mt-0.5">Líneas de crédito y movimientos de socios activos</p>
        </div>
        <button onClick={abrirRecon}
          className="flex items-center gap-2 text-sm font-bold text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 transition-colors shrink-0">
          <Scale className="h-4 w-4" /> Reconciliar saldos
        </button>
      </div>

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-400 mb-1">Total líneas otorgadas</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{formatCurrency(totalLineas)}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-400 mb-1">Total utilizado</p>
            <p className="text-xl sm:text-2xl font-black text-blue-900">{formatCurrency(totalUtilizado)}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-400 mb-1">Disponible total</p>
            <p className="text-xl sm:text-2xl font-black text-green-700">{formatCurrency(totalLineas - totalUtilizado)}</p>
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
                      <th className="text-left px-3 sm:px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Empresa</th>
                      <th className="text-left px-3 sm:px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Línea total</th>
                      <th className="text-left px-3 sm:px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Utiliza.</th>
                      <th className="hidden sm:table-cell text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-48">Uso</th>
                      <th className="hidden sm:table-cell text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Disponible</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {socios.map(s => {
                      const p = pct(s);
                      const disponible = Number(s.lineaCredito) - Number(s.creditoUtilizado);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-3 sm:px-5 py-4">
                            <div className="font-semibold text-slate-900 text-sm">{s.razonSocial}</div>
                            <div className="text-xs text-slate-400">{s.ruc}</div>
                          </td>
                          <td className="px-3 sm:px-5 py-4 text-sm font-bold text-slate-700">{formatCurrency(s.lineaCredito)}</td>
                          <td className="px-3 sm:px-5 py-4 text-sm text-slate-600">{formatCurrency(s.creditoUtilizado)}</td>
                          <td className="hidden sm:table-cell px-5 py-4">
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
                          <td className="hidden sm:table-cell px-5 py-4">
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
              {movimientos.map(m => {
                const st = movStyle(m.tipo);
                return (
                  <div key={m.id} className="flex items-center gap-4 p-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${st.bg}`}>
                      {m.tipo === "CREDITO_UTILIZADO" ? (
                        <TrendingUp className="h-4 w-4 text-red-600" />
                      ) : (m.tipo === "PAGO_RECIBIDO" || m.tipo === "CREDITO_LIBERADO") ? (
                        <TrendingDown className="h-4 w-4 text-green-600" />
                      ) : (
                        <Minus className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{m.socio.razonSocial}</p>
                      <p className="text-xs text-slate-400">{m.descripcion} · {formatDate(m.createdAt)}</p>
                    </div>
                    <span className={`text-sm font-bold shrink-0 ${st.color}`}>
                      {st.signo}{formatCurrency(m.monto)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Reconciliar saldos */}
      {reconOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setReconOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-black text-slate-900 flex items-center gap-2"><Scale className="h-5 w-5 text-[#0f1f3d]" /> Reconciliar saldos de crédito</h2>
              <button onClick={() => setReconOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500">
                Recalcula el crédito utilizado de cada socio (= suma de sus facturas por cobrar) y registra los pagos que faltan en su historial.
                Revisa el antes/después y aplica cuando estés conforme.
              </p>

              {reconError && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{reconError}</p>}

              {reconResult ? (
                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 flex items-center gap-2">
                  <Check className="h-4 w-4" /> Listo: {reconResult.sociosAjustados} socio(s) ajustado(s), {reconResult.pagosRegistrados} pago(s) registrado(s) en el historial.
                </p>
              ) : reconLoading ? (
                <div className="p-8 text-center text-slate-400 text-sm">Calculando…</div>
              ) : reconPlanes && reconPlanes.length > 0 ? (
                (() => {
                  const cambian = reconPlanes.filter(p => Math.abs(p.diferencia) >= 0.005 || p.pagosFaltantes.length > 0);
                  if (cambian.length === 0) {
                    return <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-3">Todo está cuadrado — no hay nada que corregir. 👍</p>;
                  }
                  return (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Socio</th>
                            <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Utiliza. actual</th>
                            <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Corregido</th>
                            <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Pagos a registrar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {cambian.map(p => (
                            <tr key={p.socioId}>
                              <td className="px-3 py-2.5 font-semibold text-slate-800">{p.razonSocial}</td>
                              <td className="px-3 py-2.5 text-right text-slate-500">{formatCurrency(p.utilizadoActual)}</td>
                              <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                                {formatCurrency(p.utilizadoCorrecto)}
                                {p.diferencia < 0 && <span className="text-green-600 text-xs"> ({formatCurrency(p.diferencia)})</span>}
                                {p.diferencia > 0 && <span className="text-red-600 text-xs"> (+{formatCurrency(p.diferencia)})</span>}
                              </td>
                              <td className="px-3 py-2.5 text-right text-slate-600">{p.pagosFaltantes.length || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()
              ) : reconPlanes ? (
                <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-3">No hay socios a crédito para reconciliar.</p>
              ) : null}

              {!reconResult && reconPlanes && reconPlanes.some(p => Math.abs(p.diferencia) >= 0.005 || p.pagosFaltantes.length > 0) && (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setReconOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
                  <button onClick={aplicarRecon} disabled={reconApplying}
                    className="flex-1 py-2.5 rounded-xl bg-[#0f1f3d] hover:bg-[#16294f] text-white text-sm font-bold disabled:opacity-40">
                    {reconApplying ? "Aplicando…" : "Aplicar corrección"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
