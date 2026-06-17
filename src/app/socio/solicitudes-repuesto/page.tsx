"use client";

import { useState, useEffect } from "react";
import { Search, Plus, X, Check, Clock, Package, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SolicitudRepuesto {
  id: string;
  numero: string;
  marcaVehiculo?: string;
  modeloVehiculo?: string;
  anioVehiculo?: string;
  descripcion: string;
  cantidad: number;
  notas?: string;
  status: "PENDIENTE" | "EN_PROCESO" | "COMPLETADA" | "CANCELADA";
  createdAt: string;
  pedido?: { status: string; numero: string } | null;
}

const statusConfig = {
  PENDIENTE: { label: "Pendiente", color: "bg-amber-100 text-amber-700" },
  EN_PROCESO: { label: "En proceso", color: "bg-blue-100 text-blue-700" },
  COMPLETADA: { label: "Completada", color: "bg-green-100 text-green-700" },
  CANCELADA: { label: "Cancelada", color: "bg-red-100 text-red-700" },
};

const MARCAS = ["Toyota", "Nissan", "Mitsubishi", "Hyundai", "Kia", "Volkswagen", "Chevrolet", "Ford", "BYD", "Chery", "JAC", "Jetour", "Land Rover", "Jeep", "Otro"];

export default function SolicitudesRepuestoPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudRepuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    marcaVehiculo: "",
    modeloVehiculo: "",
    anioVehiculo: "",
    descripcion: "",
    cantidad: 1,
    notas: "",
  });

  useEffect(() => {
    fetch("/api/socio/solicitudes-repuesto")
      .then(r => r.json())
      .then(d => { setSolicitudes(d.solicitudes || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!form.descripcion || form.descripcion.length < 5) return;
    setSending(true);
    const res = await fetch("/api/socio/solicitudes-repuesto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setSolicitudes(prev => [data, ...prev]);
      setSuccess(true);
      setForm({ marcaVehiculo: "", modeloVehiculo: "", anioVehiculo: "", descripcion: "", cantidad: 1, notas: "" });
    }
    setSending(false);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSuccess(false);
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Repuestos específicos</h1>
          <p className="text-slate-500 text-sm mt-0.5">¿No encuentras lo que buscas? Solicítalo y nuestro equipo lo cotiza.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setSuccess(false); }}
          className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva solicitud
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <Search className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900">Servicio de búsqueda especializada</p>
          <p className="text-xs text-blue-600 mt-0.5">Describe el repuesto que necesitas con la mayor precisión posible. Nuestro equipo lo localizará y le enviará la cotización para su aprobación.</p>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Cargando...</div>
      ) : solicitudes.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-14 w-14 text-slate-200 mx-auto mb-4" />
          <p className="font-semibold text-slate-600">Sin solicitudes aún</p>
          <p className="text-slate-400 text-sm mt-1">Use el botón "Nueva solicitud" para comenzar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {solicitudes.map(s => (
            <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-400">{s.numero}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusConfig[s.status].color}`}>
                      {statusConfig[s.status].label}
                    </span>
                  </div>
                  {(s.marcaVehiculo || s.modeloVehiculo) && (
                    <p className="text-xs text-blue-700 font-semibold mb-1">
                      {[s.marcaVehiculo, s.modeloVehiculo, s.anioVehiculo].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="text-sm font-bold text-slate-900">{s.descripcion}</p>
                  <p className="text-xs text-slate-400 mt-1">Cantidad: {s.cantidad} · {formatDate(s.createdAt)}</p>
                  {s.notas && <p className="text-xs text-slate-500 mt-1 italic">"{s.notas}"</p>}
                </div>
                {s.status === "PENDIENTE" && (
                  <Clock className="h-5 w-5 text-amber-400 shrink-0" />
                )}
                {s.status === "EN_PROCESO" && s.pedido && (
                  <div className="text-right shrink-0">
                    <p className="text-xs text-blue-600 font-semibold">Pedido generado</p>
                    <p className="text-xs text-slate-400">{s.pedido.numero}</p>
                    <a href="/socio/pedidos" className="text-xs text-blue-700 font-bold flex items-center gap-0.5 justify-end mt-0.5 hover:underline">
                      Ver pedido <ChevronRight className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {s.status === "COMPLETADA" && (
                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {success ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">¡Solicitud enviada!</h3>
                <p className="text-slate-500 text-sm mb-6">Nuestro equipo la revisará y le enviará la cotización pronto.</p>
                <button onClick={handleCloseForm} className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold text-sm">Cerrar</button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-black text-slate-900">Solicitar repuesto específico</h3>
                  <button onClick={handleCloseForm} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
                </div>

                <div className="space-y-4">
                  {/* Vehículo */}
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Vehículo (opcional)</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Marca</label>
                        <select
                          value={form.marcaVehiculo}
                          onChange={e => setForm(p => ({ ...p, marcaVehiculo: e.target.value }))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="">Seleccionar...</option>
                          {MARCAS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Modelo</label>
                        <input
                          value={form.modeloVehiculo}
                          onChange={e => setForm(p => ({ ...p, modeloVehiculo: e.target.value }))}
                          placeholder="Ej: Hilux, Navara..."
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="block text-xs text-slate-600 mb-1">Año</label>
                      <input
                        value={form.anioVehiculo}
                        onChange={e => setForm(p => ({ ...p, anioVehiculo: e.target.value }))}
                        placeholder="Ej: 2020"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  {/* Repuesto */}
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Repuesto *</p>
                    <label className="block text-xs text-slate-600 mb-1">Descripción del repuesto</label>
                    <textarea
                      value={form.descripcion}
                      onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                      placeholder="Ej: Kit de embrague completo, disco + prensa + collarín"
                      rows={3}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Cantidad</label>
                    <input
                      type="number"
                      min={1}
                      value={form.cantidad}
                      onChange={e => setForm(p => ({ ...p, cantidad: parseInt(e.target.value) || 1 }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Notas adicionales</label>
                    <textarea
                      value={form.notas}
                      onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
                      placeholder="Urgencia, especificaciones técnicas, número de parte si lo conoce..."
                      rows={2}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button onClick={handleCloseForm} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600">Cancelar</button>
                  <button
                    onClick={handleSubmit}
                    disabled={sending || form.descripcion.length < 5}
                    className="flex-1 py-2.5 rounded-xl bg-blue-900 text-white text-sm font-bold disabled:opacity-50 transition-colors"
                  >
                    {sending ? "Enviando..." : "Enviar solicitud"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
