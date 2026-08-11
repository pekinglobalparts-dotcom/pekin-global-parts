"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, X, CreditCard, Mail, Phone, Building2, Edit2, Check, Trash2, Settings } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Socio {
  id: string;
  razonSocial: string;
  ruc: string;
  emailCorporativo: string;
  telefono: string;
  sector: string;
  status: string;
  lineaCredito: number;
  creditoUtilizado: number;
  tipoPago: string;
  plazoCredito: number;
  createdAt: string;
  ultimoAcceso?: string | null;
  passwordCambiado?: boolean;
  _count: { pedidos: number; cotizaciones: number };
}

// "hace X" legible para el último acceso
function tiempoRelativo(iso?: string | null): string {
  if (!iso) return "Nunca ha ingresado";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Hace un momento";
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Hace ${h} h`;
  const dias = Math.floor(h / 24);
  if (dias === 1) return "Ayer";
  if (dias < 30) return `Hace ${dias} días`;
  return d.toLocaleDateString("es-PE");
}

const statusVariant: Record<string, "success" | "warning" | "secondary"> = {
  ACTIVO: "success",
  SUSPENDIDO: "warning",
  INACTIVO: "secondary",
};

export default function AdminSociosPage() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ACTIVO");
  const [selected, setSelected] = useState<Socio | null>(null);
  const [editingCredito, setEditingCredito] = useState(false);
  const [editingModalidad, setEditingModalidad] = useState(false);
  const [nuevaLinea, setNuevaLinea] = useState("");
  const [nuevoTipoPago, setNuevoTipoPago] = useState<"CREDITO" | "CONTADO">("CREDITO");
  const [nuevoPlazo, setNuevoPlazo] = useState("30");
  const [saving, setSaving] = useState(false);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      status: filter,
      ...(search && { search }),
    });
    const res = await fetch(`/api/admin/socios?${params}`);
    const data = await res.json();
    setSocios(data.socios || []);
    setLoading(false);
  }, [filter, search]);

  useEffect(() => {
    const t = setTimeout(fetch_, 300);
    return () => clearTimeout(t);
  }, [fetch_]);

  const updateStatus = async (id: string, status: string) => {
    setSaving(true);
    await fetch(`/api/admin/socios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSocios(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    if (selected?.id === id) setSelected(s => s ? { ...s, status } : null);
    setSaving(false);
  };

  const updateModalidad = async () => {
    if (!selected) return;
    setSaving(true);
    await fetch(`/api/admin/socios/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoPago: nuevoTipoPago,
        plazoCredito: nuevoTipoPago === "CREDITO" ? parseInt(nuevoPlazo) : 0,
        lineaCredito: nuevoTipoPago === "CREDITO" ? parseFloat(nuevaLinea) : 0,
      }),
    });
    setSocios(prev => prev.map(s => s.id === selected.id ? { ...s, tipoPago: nuevoTipoPago, plazoCredito: parseInt(nuevoPlazo) } : s));
    setSelected(s => s ? { ...s, tipoPago: nuevoTipoPago, plazoCredito: parseInt(nuevoPlazo) } : null);
    setEditingModalidad(false);
    setSaving(false);
  };

  const updateCredito = async () => {
    if (!selected) return;
    setSaving(true);
    await fetch(`/api/admin/socios/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lineaCredito: parseFloat(nuevaLinea) }),
    });
    const newVal = parseFloat(nuevaLinea);
    setSocios(prev => prev.map(s => s.id === selected.id ? { ...s, lineaCredito: newVal } : s));
    setSelected(s => s ? { ...s, lineaCredito: newVal } : null);
    setEditingCredito(false);
    setSaving(false);
  };

  const deleteSocio = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este socio? Esta acción no se puede deshacer.")) return;
    setSaving(true);
    await fetch(`/api/admin/socios/${id}`, { method: "DELETE" });
    setSocios(prev => prev.filter(s => s.id !== id));
    setSelected(null);
    setSaving(false);
  };

  const creditoDisponible = (s: Socio) =>
    Number(s.lineaCredito) - Number(s.creditoUtilizado);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Socios</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {socios.length} socios registrados
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar empresa, RUC..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
        </div>
        {["ACTIVO", "SUSPENDIDO", "INACTIVO"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              filter === f ? "bg-[#0f1f3d] text-white" : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Cargando...</div>
        ) : socios.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No hay socios en este estado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Empresa</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Sector</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Modalidad / Crédito</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actividad</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {socios.map(socio => (
                  <tr key={socio.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900 text-sm">{socio.razonSocial}</div>
                      <div className="text-xs text-slate-400">{socio.ruc}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{socio.sector.replace(/_/g, " ")}</td>
                    <td className="px-5 py-4">
                      {socio.tipoPago === "CONTADO" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-bold">Al contado</span>
                      ) : (
                        <>
                          <div className="text-sm font-bold text-blue-900">{formatCurrency(creditoDisponible(socio))}</div>
                          <div className="text-xs text-slate-400">{socio.plazoCredito}d · de {formatCurrency(socio.lineaCredito)}</div>
                        </>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs text-slate-600">
                        <span>{socio._count.pedidos} pedidos</span>
                        <span className="mx-1.5 text-slate-300">·</span>
                        <span>{socio._count.cotizaciones} cotizaciones</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                            socio.ultimoAcceso ? "text-slate-500" : "text-red-500"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${socio.ultimoAcceso ? "bg-green-500" : "bg-red-400"}`} />
                          {tiempoRelativo(socio.ultimoAcceso)}
                        </span>
                        {socio.ultimoAcceso && (
                          socio.passwordCambiado ? (
                            <span className="text-[11px] font-semibold text-green-600">· clave cambiada ✓</span>
                          ) : (
                            <span className="text-[11px] font-semibold text-amber-600">· clave sin cambiar</span>
                          )
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={statusVariant[socio.status] || "secondary"}>{socio.status}</Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => { setSelected(socio); setNuevaLinea(String(socio.lineaCredito)); setEditingCredito(false); }}
                        className="text-xs font-medium text-blue-900 hover:text-blue-700"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-end z-50"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl"
            >
              {/* Header */}
              <div className="bg-[#0f1f3d] px-6 py-5">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setSelected(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                  <Badge variant={statusVariant[selected.status] || "secondary"}>
                    {selected.status}
                  </Badge>
                </div>
                <h2 className="text-xl font-black text-white leading-tight">{selected.razonSocial}</h2>
                <p className="text-blue-200 text-sm mt-0.5">RUC: {selected.ruc}</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Contact */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Contacto</p>
                  <div className="space-y-2">
                    {[
                      { icon: Mail, label: selected.emailCorporativo },
                      { icon: Phone, label: selected.telefono },
                      { icon: Building2, label: selected.sector.replace(/_/g, " ") },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-3 text-sm text-slate-700">
                        <Icon className="h-4 w-4 text-slate-400 shrink-0" />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Credit / Contado */}
                {selected.tipoPago === "CONTADO" ? (
                  <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-5 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-green-100 text-xs font-semibold uppercase tracking-wide">Cuenta al contado</p>
                      <button onClick={() => { setEditingModalidad(true); setNuevoTipoPago("CONTADO"); setNuevoPlazo("30"); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                        <Edit2 className="h-3.5 w-3.5 text-green-200" />
                      </button>
                    </div>
                    <p className="text-sm font-medium text-white">Pago por transferencia o link antes del despacho</p>
                    <p className="text-green-100 text-xs mt-1">No se gestiona línea de crédito</p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-[#0f1f3d] to-blue-900 rounded-2xl p-5 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-blue-200 text-sm">Línea de crédito · {selected.plazoCredito} días</p>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingModalidad(true); setNuevoTipoPago("CREDITO"); setNuevoPlazo(String(selected.plazoCredito)); setNuevaLinea(String(selected.lineaCredito)); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Cambiar modalidad">
                          <Settings className="h-3.5 w-3.5 text-blue-300" />
                        </button>
                        <button
                          onClick={() => setEditingCredito(!editingCredito)}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-blue-200" />
                        </button>
                      </div>
                    </div>

                    {editingCredito ? (
                      <div className="flex items-center gap-2">
                        <span className="text-blue-200 text-sm">S/</span>
                        <input
                          type="number"
                          value={nuevaLinea}
                          onChange={e => setNuevaLinea(e.target.value)}
                          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                        />
                        <button
                          onClick={updateCredito}
                          disabled={saving}
                          className="p-1.5 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                        >
                          <Check className="h-3.5 w-3.5 text-white" />
                        </button>
                        <button
                          onClick={() => setEditingCredito(false)}
                          className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <X className="h-3.5 w-3.5 text-white" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-3xl font-black">{formatCurrency(creditoDisponible(selected))}</p>
                    )}

                    <div className="mt-3">
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-white rounded-full"
                          style={{
                            width: `${Math.min(
                              Number(selected.lineaCredito) > 0
                                ? (Number(selected.creditoUtilizado) / Number(selected.lineaCredito)) * 100
                                : 0,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-blue-200 mt-1.5">
                        <span>Utilizado: {formatCurrency(selected.creditoUtilizado)}</span>
                        <span>Línea: {formatCurrency(selected.lineaCredito)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Activity */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Actividad</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Pedidos", value: selected._count.pedidos, color: "bg-orange-50 text-orange-600" },
                      { label: "Cotizaciones", value: selected._count.cotizaciones, color: "bg-purple-50 text-purple-600" },
                    ].map(stat => (
                      <div key={stat.label} className={`${stat.color} rounded-xl p-4 text-center`}>
                        <p className="text-2xl font-black">{stat.value}</p>
                        <p className="text-xs mt-0.5 font-medium opacity-80">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Acceso al portal</span>
                      <span className={`text-xs font-bold ${selected.ultimoAcceso ? "text-slate-700" : "text-red-500"}`}>
                        {tiempoRelativo(selected.ultimoAcceso)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Contraseña inicial</span>
                      {!selected.ultimoAcceso ? (
                        <span className="text-xs font-bold text-slate-400">—</span>
                      ) : selected.passwordCambiado ? (
                        <span className="text-xs font-bold text-green-600">Ya la cambió ✓</span>
                      ) : (
                        <span className="text-xs font-bold text-amber-600">Aún sin cambiar</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">
                    Registrado el {formatDate(selected.createdAt)}
                  </p>
                </div>

                {/* Status change */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Cambiar estado</p>
                  <div className="flex gap-2">
                    {["ACTIVO", "SUSPENDIDO", "INACTIVO"].map(s => (
                      <button
                        key={s}
                        disabled={s === selected.status || saving}
                        onClick={() => updateStatus(selected.id, s)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 ${
                          s === selected.status
                            ? "bg-[#0f1f3d] text-white"
                            : s === "SUSPENDIDO"
                            ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            : s === "INACTIVO"
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delete */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => deleteSocio(selected.id)}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar socio
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modalidad de pago modal */}
      {editingModalidad && selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900">Cambiar modalidad de pago</h3>
              <button onClick={() => setEditingModalidad(false)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setNuevoTipoPago("CREDITO")}
                className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${nuevoTipoPago === "CREDITO" ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
              >
                💳 A crédito
              </button>
              <button
                onClick={() => setNuevoTipoPago("CONTADO")}
                className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${nuevoTipoPago === "CONTADO" ? "border-green-600 bg-green-600 text-white" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
              >
                💵 Al contado
              </button>
            </div>

            {nuevoTipoPago === "CREDITO" && (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Línea de crédito (S/)</label>
                  <input
                    type="number"
                    value={nuevaLinea}
                    onChange={e => setNuevaLinea(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Plazo de pago</label>
                  <select
                    value={nuevoPlazo}
                    onChange={e => setNuevoPlazo(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="15">15 días</option>
                    <option value="30">30 días</option>
                    <option value="45">45 días</option>
                    <option value="60">60 días</option>
                  </select>
                </div>
              </div>
            )}

            {nuevoTipoPago === "CONTADO" && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800 mb-4">
                Se eliminará la línea de crédito. El cliente pagará antes de cada despacho.
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setEditingModalidad(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button
                onClick={updateModalidad}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#0f1f3d] text-white text-sm font-bold hover:bg-blue-900 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar cambio"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
