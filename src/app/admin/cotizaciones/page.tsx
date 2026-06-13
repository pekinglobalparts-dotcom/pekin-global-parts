"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X, Check, Clock, Send, Building2, ChevronDown, ChevronUp } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CotizacionItem {
  id: string;
  cantidad: number;
  precioUnit: number | null;
  subtotal: number | null;
  notas: string | null;
  producto: { nombre: string; codigo: string; precio: number };
}

interface Cotizacion {
  id: string;
  numero: string;
  status: string;
  notas: string | null;
  respuesta: string | null;
  total: number | null;
  validaHasta: string | null;
  createdAt: string;
  socio: { razonSocial: string; emailCorporativo: string; ruc: string };
  items: CotizacionItem[];
}

const statusVariant: Record<string, "warning" | "default" | "success" | "destructive" | "secondary"> = {
  PENDIENTE: "warning",
  ENVIADA: "success",
  ACEPTADA: "success",
  RECHAZADA: "destructive",
  EXPIRADA: "secondary",
};

const FILTERS = ["TODOS", "PENDIENTE", "ENVIADA", "ACEPTADA", "RECHAZADA"];

export default function AdminCotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDIENTE");
  const [selected, setSelected] = useState<Cotizacion | null>(null);
  const [precios, setPrecios] = useState<Record<string, string>>({});
  const [respuesta, setRespuesta] = useState("");
  const [validaHasta, setValidaHasta] = useState("");
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const params = filter !== "TODOS" ? `?status=${filter}` : "";
    const res = await fetch(`/api/admin/cotizaciones${params}`);
    const data = await res.json();
    setCotizaciones(data.cotizaciones || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const openResponder = (c: Cotizacion) => {
    setSelected(c);
    const initialPrecios: Record<string, string> = {};
    c.items.forEach(item => {
      initialPrecios[item.id] = item.precioUnit
        ? String(item.precioUnit)
        : String(item.producto.precio);
    });
    setPrecios(initialPrecios);
    setRespuesta(c.respuesta || "");
    setValidaHasta(c.validaHasta ? c.validaHasta.split("T")[0] : "");
  };

  const handleResponder = async () => {
    if (!selected) return;
    setSaving(true);
    await fetch(`/api/admin/cotizaciones/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        respuesta,
        validaHasta: validaHasta || undefined,
        items: selected.items.map(item => ({
          id: item.id,
          precioUnit: parseFloat(precios[item.id] || String(item.producto.precio)),
        })),
      }),
    });
    setSelected(null);
    fetch_();
    setSaving(false);
  };

  const totalCotizacion = (c: Cotizacion) =>
    c.items.reduce((sum, item) => {
      const precio = precios[item.id]
        ? parseFloat(precios[item.id])
        : (item.precioUnit || item.producto.precio);
      return sum + precio * item.cantidad;
    }, 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Cotizaciones</h1>
        <p className="text-slate-500 text-sm mt-0.5">Responda las solicitudes de precio de sus socios</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === f
                ? "bg-[#0f1f3d] text-white"
                : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Cargando...</div>
        ) : cotizaciones.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No hay cotizaciones en este estado</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {cotizaciones.map(c => (
              <div key={c.id}>
                <div
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                >
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-blue-900" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{c.numero}</span>
                      <Badge variant={statusVariant[c.status] || "default"}>{c.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {c.socio.razonSocial} · {c.items.length} item{c.items.length > 1 ? "s" : ""} · {formatDate(c.createdAt)}
                    </p>
                  </div>
                  {c.total && (
                    <span className="text-sm font-bold text-blue-900 shrink-0">{formatCurrency(c.total)}</span>
                  )}
                  {c.status === "PENDIENTE" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={e => { e.stopPropagation(); openResponder(c); }}
                    >
                      <Send className="h-3.5 w-3.5" />
                      Responder
                    </Button>
                  )}
                  {expanded === c.id ? (
                    <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                </div>

                <AnimatePresence>
                  {expanded === c.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-50"
                    >
                      <div className="p-4 bg-slate-50 space-y-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                          Empresa: {c.socio.razonSocial} · RUC: {c.socio.ruc}
                        </p>
                        {c.items.map(item => (
                          <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-3">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900">{item.producto.nombre}</p>
                              <p className="text-xs text-slate-400">{item.producto.codigo} · Cantidad: {item.cantidad}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-400">Precio ref.</p>
                              <p className="text-sm font-bold text-slate-700">{formatCurrency(item.producto.precio)}</p>
                            </div>
                            {item.precioUnit && (
                              <div className="text-right">
                                <p className="text-xs text-slate-400">Cotizado</p>
                                <p className="text-sm font-bold text-blue-900">{formatCurrency(item.precioUnit)}</p>
                              </div>
                            )}
                          </div>
                        ))}
                        {c.respuesta && (
                          <div className="bg-green-50 border border-green-100 rounded-lg p-3 mt-2">
                            <p className="text-xs font-semibold text-green-700">Respuesta enviada:</p>
                            <p className="text-sm text-green-800 mt-0.5">{c.respuesta}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Responder modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">Responder cotización</h2>
                  <p className="text-xs text-slate-400">{selected.numero} · {selected.socio.razonSocial}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Items con precios editables */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Asignar precios por producto</p>
                  <div className="space-y-3">
                    {selected.items.map(item => (
                      <div key={item.id} className="border border-slate-200 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 text-sm">{item.producto.nombre}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {item.producto.codigo} · Cantidad: <strong>{item.cantidad}</strong>
                            </p>
                            {item.notas && (
                              <p className="text-xs text-slate-400 mt-1 italic">{item.notas}</p>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-xs text-slate-400 mb-1">Precio unit. (S/)</p>
                            <input
                              type="number"
                              value={precios[item.id] || ""}
                              onChange={e => setPrecios(p => ({ ...p, [item.id]: e.target.value }))}
                              className="w-28 border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-right font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                              placeholder={String(item.producto.precio)}
                              min="0"
                              step="0.01"
                            />
                            {precios[item.id] && (
                              <p className="text-xs text-green-600 font-semibold mt-1">
                                Subtotal: {formatCurrency(parseFloat(precios[item.id]) * item.cantidad)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total preview */}
                  <div className="mt-3 bg-blue-50 rounded-xl px-4 py-3 flex justify-between items-center">
                    <span className="text-sm font-semibold text-blue-900">Total cotización</span>
                    <span className="text-xl font-black text-blue-900">
                      {formatCurrency(totalCotizacion(selected))}
                    </span>
                  </div>
                </div>

                {/* Respuesta */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Mensaje al cliente *
                  </label>
                  <textarea
                    value={respuesta}
                    onChange={e => setRespuesta(e.target.value)}
                    placeholder="Estimado cliente, adjunto los precios para los productos solicitados. Los precios incluyen IGV y están sujetos a disponibilidad de stock..."
                    rows={4}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none"
                  />
                </div>

                {/* Válida hasta */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Cotización válida hasta (opcional)
                  </label>
                  <input
                    type="date"
                    value={validaHasta}
                    onChange={e => setValidaHasta(e.target.value)}
                    className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setSelected(null)}>
                  Cancelar
                </Button>
                <Button
                  loading={saving}
                  disabled={!respuesta.trim()}
                  onClick={handleResponder}
                >
                  <Send className="h-4 w-4" />
                  Enviar cotización al cliente
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
