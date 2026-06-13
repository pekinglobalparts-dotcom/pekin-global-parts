"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Package, ChevronDown, ChevronUp, Truck } from "lucide-react";
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

const statusConfig: Record<string, { label: string; variant: "warning" | "default" | "success" | "destructive" | "secondary"; icon: typeof ShoppingCart }> = {
  PENDIENTE: { label: "Pendiente", variant: "warning", icon: ShoppingCart },
  CONFIRMADO: { label: "Confirmado", variant: "default", icon: ShoppingCart },
  EN_PROCESO: { label: "En proceso", variant: "default", icon: Package },
  ENVIADO: { label: "Enviado", variant: "success", icon: Truck },
  ENTREGADO: { label: "Entregado", variant: "success", icon: Package },
  CANCELADO: { label: "Cancelado", variant: "destructive", icon: ShoppingCart },
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/socio/pedidos")
      .then(r => r.json())
      .then(data => { setPedidos(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Mis pedidos</h1>
        <p className="text-slate-500 text-sm mt-0.5">{pedidos.length} pedidos registrados</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
        </div>
      ) : pedidos.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-slate-200" />
          <p className="font-semibold text-slate-600 text-lg">Sin pedidos aún</p>
          <p className="text-sm mt-1 mb-6">Sus pedidos aparecerán aquí una vez confirmados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map(pedido => {
            const cfg = statusConfig[pedido.status] || statusConfig.PENDIENTE;
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
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <cfg.icon className="h-5 w-5 text-blue-900" />
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
                  <span className="font-bold text-blue-900 text-sm">{formatCurrency(pedido.total)}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="border-t border-slate-100 p-5 space-y-3">
                        {pedido.items.map(item => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                              {item.producto.imagenUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.producto.imagenUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-4 w-4 text-slate-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900">{item.producto.nombre}</p>
                              <p className="text-xs text-slate-400">{item.producto.codigo} · x{item.cantidad}</p>
                            </div>
                            <p className="text-sm font-bold text-slate-700">{formatCurrency(item.subtotal)}</p>
                          </div>
                        ))}
                        <div className="border-t border-slate-100 pt-3 flex justify-end gap-6 text-sm">
                          <span className="text-slate-500">Subtotal: {formatCurrency(pedido.subtotal)}</span>
                          <span className="text-slate-500">IGV: {formatCurrency(pedido.igv)}</span>
                          <span className="font-bold text-slate-900">Total: {formatCurrency(pedido.total)}</span>
                        </div>
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
