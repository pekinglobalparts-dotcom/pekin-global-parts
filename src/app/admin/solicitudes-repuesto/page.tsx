"use client";

import { useState, useEffect } from "react";
import { Search, Plus, X, Trash2, Check } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Solicitud {
  id: string;
  numero: string;
  marcaVehiculo?: string;
  modeloVehiculo?: string;
  anioVehiculo?: string;
  descripcion: string;
  cantidad: number;
  notas?: string;
  status: string;
  createdAt: string;
  socioId: string;
  socio: { razonSocial: string; ruc: string; emailCorporativo: string };
  pedido?: { status: string; numero: string; total: number } | null;
}

interface LineaItem {
  descripcion: string;
  cantidad: number;
  precioUnit: number;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDIENTE: { label: "Pendiente", color: "bg-amber-100 text-amber-700" },
  EN_PROCESO: { label: "En proceso", color: "bg-blue-100 text-blue-700" },
  COMPLETADA: { label: "Completada", color: "bg-green-100 text-green-700" },
  CANCELADA: { label: "Cancelada", color: "bg-red-100 text-red-700" },
};

export default function AdminSolicitudesRepuestoPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDIENTE");
  const [selected, setSelected] = useState<Solicitud | null>(null);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);

  const [items, setItems] = useState<LineaItem[]>([{ descripcion: "", cantidad: 1, precioUnit: 0 }]);
  const [notas, setNotas] = useState("");
  const [direccion, setDireccion] = useState("");

  useEffect(() => {
    fetch("/api/admin/solicitudes-repuesto")
      .then(r => r.json())
      .then(d => { setSolicitudes(d.solicitudes || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = solicitudes.filter(s => s.status === filter);

  const openModal = (s: Solicitud) => {
    setSelected(s);
    setItems([{ descripcion: s.descripcion, cantidad: s.cantidad, precioUnit: 0 }]);
    setNotas(s.notas || "");
    setDireccion("");
    setSuccess(false);
  };

  const addItem = () => setItems(p => [...p, { descripcion: "", cantidad: 1, precioUnit: 0 }]);
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof LineaItem, val: string | number) => {
    setItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  };

  const total = items.reduce((s, i) => s + i.precioUnit * i.cantidad, 0);

  const handleCrearPedido = async () => {
    if (!selected) return;
    setCreating(true);
    const res = await fetch("/api/admin/pedidos/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        socioId: selected.socioId,
        solicitudRepuestoId: selected.id,
        items,
        notas,
        direccionEntrega: direccion,
      }),
    });

    if (res.ok) {
      setSuccess(true);
      setSolicitudes(prev => prev.map(s =>
        s.id === selected.id ? { ...s, status: "EN_PROCESO" } : s
      ));
    }
    setCreating(false);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Repuestos específicos</h1>
        <p className="text-slate-500 text-sm mt-0.5">Solicitudes de socios para repuestos no listados en el portal.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["PENDIENTE", "EN_PROCESO", "COMPLETADA", "CANCELADA"].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === s ? "bg-blue-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {statusConfig[s].label}
            {s === "PENDIENTE" && solicitudes.filter(x => x.status === "PENDIENTE").length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {solicitudes.filter(x => x.status === "PENDIENTE").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Search className="h-10 w-10 mx-auto mb-3 text-slate-200" />
            <p className="text-sm">No hay solicitudes en este estado</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Socio</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Vehículo</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Repuesto solicitado</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 text-sm">{s.socio.razonSocial}</div>
                    <div className="text-xs text-slate-400">{s.socio.ruc}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {[s.marcaVehiculo, s.modeloVehiculo, s.anioVehiculo].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900 font-medium line-clamp-2">{s.descripcion}</p>
                    <p className="text-xs text-slate-400">Cant: {s.cantidad}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDate(s.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    {s.status === "PENDIENTE" ? (
                      <button
                        onClick={() => openModal(s)}
                        className="bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Generar pedido
                      </button>
                    ) : s.pedido ? (
                      <span className="text-xs text-slate-500">{s.pedido.numero}</span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: crear pedido manual */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">¡Pedido generado!</h3>
                <p className="text-slate-500 text-sm mb-2">El socio <strong>{selected.socio.razonSocial}</strong> recibirá una notificación.</p>
                <p className="text-slate-500 text-sm mb-6">El pedido aparecerá en la sección Pedidos para continuar el proceso.</p>
                <button onClick={() => setSelected(null)} className="bg-blue-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm">Cerrar</button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-black text-slate-900">Generar pedido manual</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{selected.socio.razonSocial} · {selected.numero}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
                </div>

                {/* Solicitud original */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Solicitud del socio</p>
                  {(selected.marcaVehiculo || selected.modeloVehiculo) && (
                    <p className="text-sm font-semibold text-blue-900">{[selected.marcaVehiculo, selected.modeloVehiculo, selected.anioVehiculo].filter(Boolean).join(" · ")}</p>
                  )}
                  <p className="text-sm text-slate-700 mt-1">{selected.descripcion}</p>
                  {selected.notas && <p className="text-xs text-slate-500 mt-1 italic">"{selected.notas}"</p>}
                </div>

                {/* Items del pedido */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Líneas del pedido</p>
                    <button onClick={addItem} className="flex items-center gap-1 text-xs text-blue-700 font-semibold hover:underline">
                      <Plus className="h-3.5 w-3.5" /> Agregar línea
                    </button>
                  </div>
                  <div className="space-y-2">
                    {items.map((item, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <input
                            value={item.descripcion}
                            onChange={e => updateItem(i, "descripcion", e.target.value)}
                            placeholder="Descripción del ítem"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            min={1}
                            value={item.cantidad}
                            onChange={e => updateItem(i, "cantidad", parseInt(e.target.value) || 1)}
                            placeholder="Cant."
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-center"
                          />
                        </div>
                        <div className="col-span-3">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">S/</span>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={item.precioUnit}
                              onChange={e => updateItem(i, "precioUnit", parseFloat(e.target.value) || 0)}
                              placeholder="Precio"
                              className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div className="col-span-1 text-sm font-bold text-blue-900 text-right">
                          {formatCurrency(item.precioUnit * item.cantidad)}
                        </div>
                        <div className="col-span-1 flex justify-center">
                          {items.length > 1 && (
                            <button onClick={() => removeItem(i)} className="text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center bg-slate-50 rounded-xl px-4 py-3 mb-4">
                  <span className="text-sm text-slate-500">Total Inc. IGV</span>
                  <span className="text-xl font-black text-blue-900">{formatCurrency(total)}</span>
                </div>

                {/* Notas y dirección */}
                <div className="space-y-3 mb-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Dirección de entrega</label>
                    <input
                      value={direccion}
                      onChange={e => setDireccion(e.target.value)}
                      placeholder="Dirección de entrega (opcional)"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Notas internas</label>
                    <textarea
                      value={notas}
                      onChange={e => setNotas(e.target.value)}
                      rows={2}
                      placeholder="Notas del pedido..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setSelected(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600">Cancelar</button>
                  <button
                    onClick={handleCrearPedido}
                    disabled={creating || items.some(i => !i.descripcion || i.precioUnit <= 0)}
                    className="flex-1 py-2.5 rounded-xl bg-blue-900 text-white text-sm font-bold disabled:opacity-50"
                  >
                    {creating ? "Generando..." : `Generar pedido · ${formatCurrency(total)}`}
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
