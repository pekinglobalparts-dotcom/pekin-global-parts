"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Clock, ChevronDown, ChevronUp, MessageCircle, Check, X, ShoppingCart } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CotizacionItem {
  id: string;
  cantidad: number;
  precioUnit: number | null;
  subtotal: number | null;
  notas: string | null;
  producto: { nombre: string; codigo: string };
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
  items: CotizacionItem[];
}

const statusConfig: Record<string, { label: string; variant: "warning" | "default" | "success" | "destructive" | "secondary" }> = {
  PENDIENTE: { label: "Esperando respuesta", variant: "warning" },
  ENVIADA: { label: "Respondida", variant: "success" },
  ACEPTADA: { label: "Aceptada", variant: "success" },
  RECHAZADA: { label: "Rechazada", variant: "destructive" },
  EXPIRADA: { label: "Expirada", variant: "secondary" },
};

function CotizacionCard({ cotizacion, onUpdate }: { cotizacion: Cotizacion; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState<"ACEPTAR" | "RECHAZAR" | null>(null);
  const cfg = statusConfig[cotizacion.status] || statusConfig.PENDIENTE;
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51987654321";

  const handleAction = async (action: "ACEPTAR" | "RECHAZAR") => {
    setLoading(action);
    await fetch(`/api/socio/cotizaciones/${cotizacion.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(null);
    onUpdate();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden"
    >
      <div
        className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          cotizacion.status === "ENVIADA" ? "bg-green-50" :
          cotizacion.status === "ACEPTADA" ? "bg-blue-50" :
          cotizacion.status === "RECHAZADA" ? "bg-red-50" : "bg-slate-50"
        }`}>
          <FileText className={`h-5 w-5 ${
            cotizacion.status === "ENVIADA" ? "text-green-600" :
            cotizacion.status === "ACEPTADA" ? "text-blue-900" :
            cotizacion.status === "RECHAZADA" ? "text-red-500" : "text-slate-400"
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-slate-900 text-sm">{cotizacion.numero}</span>
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
          </div>
          <p className="text-xs text-slate-400">
            {cotizacion.items.length} producto{cotizacion.items.length !== 1 ? "s" : ""} ·{" "}
            {formatDate(cotizacion.createdAt)}
          </p>
        </div>
        {cotizacion.total && (
          <span className="font-bold text-blue-900 text-sm shrink-0">{formatCurrency(cotizacion.total)}</span>
        )}
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-slate-100 p-5 space-y-4">
              {/* Items */}
              <div className="space-y-2">
                {cotizacion.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.producto.nombre}</p>
                      <p className="text-xs text-slate-400">{item.producto.codigo} · Cantidad: {item.cantidad}</p>
                      {item.notas && <p className="text-xs text-slate-400 italic mt-0.5">{item.notas}</p>}
                    </div>
                    {item.precioUnit ? (
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-sm font-bold text-blue-900">{formatCurrency(item.subtotal || 0)}</p>
                        <p className="text-xs text-slate-400">{formatCurrency(item.precioUnit)} × {item.cantidad}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 ml-4">Pendiente</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Respuesta del admin */}
              {cotizacion.respuesta && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1.5">
                    Respuesta de Pekin Global Parts
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">{cotizacion.respuesta}</p>
                  {cotizacion.validaHasta && (
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      Válida hasta: {formatDate(cotizacion.validaHasta)}
                    </p>
                  )}
                  {cotizacion.total && (
                    <div className="mt-3 pt-3 border-t border-blue-100 flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-700">Total cotizado</span>
                      <span className="text-xl font-black text-blue-900">{formatCurrency(cotizacion.total)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons for ENVIADA */}
              {cotizacion.status === "ENVIADA" && (
                <div className="flex gap-3 pt-1">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    loading={loading === "ACEPTAR"}
                    disabled={loading !== null}
                    onClick={() => handleAction("ACEPTAR")}
                  >
                    <Check className="h-4 w-4" />
                    Aceptar y generar pedido
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    loading={loading === "RECHAZAR"}
                    disabled={loading !== null}
                    onClick={() => handleAction("RECHAZAR")}
                  >
                    <X className="h-4 w-4" />
                    Rechazar
                  </Button>
                </div>
              )}

              {cotizacion.status === "ACEPTADA" && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-4 py-3">
                  <ShoppingCart className="h-4 w-4 text-green-600 shrink-0" />
                  <p className="text-sm text-green-700 font-medium">
                    Pedido generado. Puede seguirlo en{" "}
                    <a href="/socio/pedidos" className="font-bold underline">Mis pedidos</a>.
                  </p>
                </div>
              )}

              {cotizacion.status === "PENDIENTE" && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <Clock className="h-4 w-4 shrink-0" />
                  Nuestro equipo está preparando su cotización...
                </div>
              )}

              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hola, consulto sobre mi cotización ${cotizacion.numero}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700"
              >
                <MessageCircle className="h-4 w-4" />
                Consultar por WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("TODOS");

  const fetchData = () => {
    fetch("/api/socio/cotizaciones")
      .then(r => r.json())
      .then(data => { setCotizaciones(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = filter === "TODOS"
    ? cotizaciones
    : cotizaciones.filter(c => c.status === filter);

  const pendingResponse = cotizaciones.filter(c => c.status === "ENVIADA").length;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Mis cotizaciones</h1>
          <p className="text-slate-500 text-sm mt-0.5">{cotizaciones.length} cotizaciones en total</p>
        </div>
        <a href="/socio/catalogo" className="bg-[#0f1f3d] hover:bg-blue-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          + Solicitar cotización
        </a>
      </div>

      {pendingResponse > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
            <Check className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-green-800 text-sm">
              {pendingResponse === 1 ? "Tiene 1 cotización respondida" : `Tiene ${pendingResponse} cotizaciones respondidas`}
            </p>
            <p className="text-green-700 text-xs">Revíselas y acepte para generar su pedido</p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
        {["TODOS", "PENDIENTE", "ENVIADA", "ACEPTADA", "RECHAZADA"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {f === "TODOS" ? "Todos" :
             f === "PENDIENTE" ? "Pendientes" :
             f === "ENVIADA" ? "Respondidas" :
             f === "ACEPTADA" ? "Aceptadas" : "Rechazadas"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <FileText className="h-16 w-16 mx-auto mb-4 text-slate-200" />
          <p className="font-semibold text-slate-600 text-lg">Sin cotizaciones</p>
          <p className="text-sm mt-1 mb-6">Explore el catálogo y solicite su primera cotización</p>
          <a href="/socio/catalogo" className="bg-[#0f1f3d] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-900 transition-colors">
            Ver catálogo
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <CotizacionCard key={c.id} cotizacion={c} onUpdate={fetchData} />
          ))}
        </div>
      )}
    </div>
  );
}
