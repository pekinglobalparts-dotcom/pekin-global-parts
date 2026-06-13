"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Clock, Check, X, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
  PENDIENTE: { label: "Pendiente", variant: "warning" },
  ENVIADA: { label: "Respondida", variant: "success" },
  ACEPTADA: { label: "Aceptada", variant: "success" },
  RECHAZADA: { label: "Rechazada", variant: "destructive" },
  EXPIRADA: { label: "Expirada", variant: "secondary" },
};

function CotizacionCard({ cotizacion }: { cotizacion: Cotizacion }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusConfig[cotizacion.status] || statusConfig.PENDIENTE;
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51987654321";

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
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
          <FileText className="h-5 w-5 text-blue-900" />
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
          <span className="font-bold text-blue-900 text-sm">{formatCurrency(cotizacion.total)}</span>
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
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.producto.nombre}</p>
                      <p className="text-xs text-slate-400">{item.producto.codigo} · Cantidad: {item.cantidad}</p>
                      {item.notas && <p className="text-xs text-slate-400 mt-0.5">{item.notas}</p>}
                    </div>
                    {item.precioUnit && (
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-sm font-bold text-blue-900">{formatCurrency(item.subtotal || 0)}</p>
                        <p className="text-xs text-slate-400">{formatCurrency(item.precioUnit)} x {item.cantidad}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Respuesta del admin */}
              {cotizacion.respuesta && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
                    Respuesta de Pekin Global Parts
                  </p>
                  <p className="text-sm text-green-800">{cotizacion.respuesta}</p>
                </div>
              )}

              {cotizacion.status === "PENDIENTE" && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <Clock className="h-4 w-4" />
                  Esperando respuesta de nuestro equipo...
                </div>
              )}

              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hola, consulto sobre mi cotización ${cotizacion.numero}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  Consultar por WhatsApp
                </a>
              </div>
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

  useEffect(() => {
    fetch("/api/socio/cotizaciones")
      .then(r => r.json())
      .then(data => { setCotizaciones(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Mis cotizaciones</h1>
          <p className="text-slate-500 text-sm mt-0.5">{cotizaciones.length} cotizaciones en total</p>
        </div>
        <a href="/socio/catalogo">
          <button className="bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
            + Nueva cotización
          </button>
        </a>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : cotizaciones.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <FileText className="h-16 w-16 mx-auto mb-4 text-slate-200" />
          <p className="font-semibold text-slate-600 text-lg">Sin cotizaciones</p>
          <p className="text-sm mt-1 mb-6">Explore el catálogo y solicite su primera cotización</p>
          <a href="/socio/catalogo" className="bg-blue-900 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors">
            Ver catálogo
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {cotizaciones.map(c => (
            <CotizacionCard key={c.id} cotizacion={c} />
          ))}
        </div>
      )}
    </div>
  );
}
