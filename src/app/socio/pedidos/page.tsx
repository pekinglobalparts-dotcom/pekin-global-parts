"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Package, ChevronDown, ChevronUp, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PedidoItem {
  id: string;
  cantidad: number;
  precioUnit: number;
  subtotal: number;
  producto: { nombre: string; codigo: string; imagenUrl: string | null };
}

interface Pedido {
  id: string;
  numero: string;
  status: string;
  total: number;
  subtotal: number;
  igv: number;
  direccionEntrega: string | null;
  fechaEntrega: string | null;
  notas: string | null;
  createdAt: string;
  items: PedidoItem[];
}

const STATUS_FLOW = ["PENDIENTE", "CONFIRMADO", "EN_PROCESO", "ENVIADO", "ENTREGADO"];

const statusConfig: Record<string, { label: string; variant: "warning" | "default" | "success" | "destructive" | "secondary" }> = {
  PENDIENTE: { label: "Pendiente", variant: "warning" },
  CONFIRMADO: { label: "Confirmado", variant: "default" },
  EN_PROCESO: { label: "En proceso", variant: "default" },
  ENVIADO: { label: "Enviado", variant: "success" },
  ENTREGADO: { label: "Entregado", variant: "success" },
  CANCELADO: { label: "Cancelado", variant: "destructive" },
};

const statusIcons: Record<string, typeof Clock> = {
  PENDIENTE: Clock,
  CONFIRMADO: CheckCircle,
  EN_PROCESO: Package,
  ENVIADO: Truck,
  ENTREGADO: CheckCircle,
  CANCELADO: XCircle,
};

function StatusTimeline({ current }: { current: string }) {
  if (current === "CANCELADO") {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm py-2">
        <XCircle className="h-4 w-4" />
        <span className="font-medium">Pedido cancelado</span>
      </div>
    );
  }

  const currentIdx = STATUS_FLOW.indexOf(current);

  return (
    <div className="flex items-center gap-0 mt-1 mb-2">
      {STATUS_FLOW.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        const labels: Record<string, string> = {
          PENDIENTE: "Pendiente",
          CONFIRMADO: "Confirmado",
          EN_PROCESO: "En proceso",
          ENVIADO: "Enviado",
          ENTREGADO: "Entregado",
        };

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: active ? 1.1 : 1 }}
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                  done
                    ? active
                      ? "bg-blue-900 border-blue-900 shadow-lg shadow-blue-900/30"
                      : "bg-green-500 border-green-500"
                    : "bg-white border-slate-200"
                }`}
              >
                {done && !active ? (
                  <CheckCircle className="h-4 w-4 text-white" />
                ) : (
                  <div className={`w-2.5 h-2.5 rounded-full ${active ? "bg-white" : "bg-slate-300"}`} />
                )}
              </motion.div>
              <span className={`text-[9px] mt-1 font-medium text-center leading-tight max-w-[50px] ${
                done ? "text-slate-700" : "text-slate-300"
              }`}>
                {labels[step]}
              </span>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 transition-colors ${
                i < currentIdx ? "bg-green-500" : "bg-slate-200"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState("ACTIVOS");

  useEffect(() => {
    fetch("/api/socio/pedidos")
      .then(r => r.json())
      .then(data => { setPedidos(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "ACTIVOS"
    ? pedidos.filter(p => !["ENTREGADO", "CANCELADO"].includes(p.status))
    : filter === "ENTREGADO"
    ? pedidos.filter(p => p.status === "ENTREGADO")
    : pedidos;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Mis pedidos</h1>
        <p className="text-slate-500 text-sm mt-0.5">{pedidos.length} pedidos registrados</p>
      </div>

      {/* Filters */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
        {[
          { key: "ACTIVOS", label: "Activos" },
          { key: "ENTREGADO", label: "Entregados" },
          { key: "TODOS", label: "Todos" },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === f.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-slate-200" />
          <p className="font-semibold text-slate-600 text-lg">Sin pedidos {filter === "ACTIVOS" ? "activos" : ""}</p>
          <p className="text-sm mt-1 mb-6">Sus pedidos aparecerán aquí una vez confirmados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(pedido => {
            const cfg = statusConfig[pedido.status] || statusConfig.PENDIENTE;
            const Icon = statusIcons[pedido.status] || ShoppingCart;
            const isOpen = expanded === pedido.id;
            return (
              <motion.div
                key={pedido.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <div
                  className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : pedido.id)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    pedido.status === "ENVIADO" || pedido.status === "ENTREGADO" ? "bg-green-50" :
                    pedido.status === "CANCELADO" ? "bg-red-50" : "bg-blue-50"
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      pedido.status === "ENVIADO" || pedido.status === "ENTREGADO" ? "text-green-600" :
                      pedido.status === "CANCELADO" ? "text-red-500" : "text-blue-900"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-slate-900 text-sm">{pedido.numero}</span>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </div>
                    <p className="text-xs text-slate-400">
                      {pedido.items.length} producto{pedido.items.length !== 1 ? "s" : ""} · {formatDate(pedido.createdAt)}
                    </p>
                  </div>
                  <span className="font-bold text-blue-900 text-sm shrink-0">{formatCurrency(pedido.total)}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="border-t border-slate-100 p-5 space-y-4">
                        {/* Timeline */}
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Estado del pedido</p>
                          <StatusTimeline current={pedido.status} />
                        </div>

                        {/* Items */}
                        <div className="space-y-2">
                          {pedido.items.map(item => (
                            <div key={item.id} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                              <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 overflow-hidden shrink-0">
                                {item.producto.imagenUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={item.producto.imagenUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-4 w-4 text-slate-300" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{item.producto.nombre}</p>
                                <p className="text-xs text-slate-400">{item.producto.codigo} · ×{item.cantidad}</p>
                              </div>
                              <p className="text-sm font-bold text-slate-700 shrink-0">{formatCurrency(item.subtotal)}</p>
                            </div>
                          ))}
                        </div>

                        {/* Totals */}
                        <div className="bg-slate-50 rounded-xl px-4 py-3 space-y-1.5">
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Subtotal</span>
                            <span>{formatCurrency(pedido.subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>IGV (18%)</span>
                            <span>{formatCurrency(pedido.igv)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-200">
                            <span className="text-slate-900">Total</span>
                            <span className="text-blue-900">{formatCurrency(pedido.total)}</span>
                          </div>
                        </div>

                        {pedido.fechaEntrega && (
                          <p className="text-xs text-slate-500">
                            Entrega estimada: <strong>{formatDate(pedido.fechaEntrega)}</strong>
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
