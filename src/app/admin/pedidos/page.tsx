"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ChevronDown, ChevronUp, Truck, Package, Check } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PedidoItem {
  id: string;
  cantidad: number;
  precioUnit: number;
  subtotal: number;
  producto: { nombre: string; codigo: string };
}

interface Pedido {
  id: string;
  numero: string;
  status: string;
  total: number;
  subtotal: number;
  igv: number;
  notas: string | null;
  createdAt: string;
  socio: { razonSocial: string; ruc: string; emailCorporativo: string };
  items: PedidoItem[];
}

const STATUSES = ["PENDIENTE", "CONFIRMADO", "EN_PROCESO", "ENVIADO", "ENTREGADO", "CANCELADO"];
const FILTERS = ["TODOS", "PENDIENTE", "CONFIRMADO", "EN_PROCESO", "ENVIADO", "ENTREGADO"];

const statusVariant: Record<string, "warning" | "default" | "success" | "destructive" | "secondary"> = {
  PENDIENTE: "warning",
  CONFIRMADO: "default",
  EN_PROCESO: "default",
  ENVIADO: "success",
  ENTREGADO: "success",
  CANCELADO: "destructive",
};

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("TODOS");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const params = filter !== "TODOS" ? `?status=${filter}` : "";
    const res = await fetch(`/api/admin/pedidos${params}`);
    const data = await res.json();
    setPedidos(data.pedidos || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch(`/api/admin/pedidos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setPedidos(prev =>
      prev.map(p => p.id === id ? { ...p, status } : p)
    );
    setUpdating(null);
  };

  const nextStatus = (current: string): string | null => {
    const idx = STATUSES.indexOf(current);
    if (idx < 0 || idx >= STATUSES.length - 2) return null;
    return STATUSES[idx + 1];
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Pedidos</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Gestione el flujo de pedidos de sus socios
        </p>
      </div>

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

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Cargando...</div>
        ) : pedidos.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No hay pedidos en este estado</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {pedidos.map(pedido => {
              const next = nextStatus(pedido.status);
              return (
                <div key={pedido.id}>
                  <div
                    className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === pedido.id ? null : pedido.id)}
                  >
                    <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                      <ShoppingCart className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{pedido.numero}</span>
                        <Badge variant={statusVariant[pedido.status] || "default"}>
                          {pedido.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {pedido.socio.razonSocial} · {pedido.items.length} productos · {formatDate(pedido.createdAt)}
                      </p>
                    </div>
                    <span className="font-bold text-blue-900 text-sm shrink-0">{formatCurrency(pedido.total)}</span>

                    {next && (
                      <Button
                        size="sm"
                        variant="outline"
                        loading={updating === pedido.id}
                        onClick={e => { e.stopPropagation(); updateStatus(pedido.id, next); }}
                        className="shrink-0"
                      >
                        {next === "ENVIADO" ? <Truck className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                        {next.replace(/_/g, " ")}
                      </Button>
                    )}

                    {expanded === pedido.id
                      ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                      : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                  </div>

                  <AnimatePresence>
                    {expanded === pedido.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-50"
                      >
                        <div className="p-4 bg-slate-50 space-y-2">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                            {pedido.socio.razonSocial} · {pedido.socio.emailCorporativo}
                          </p>
                          {pedido.items.map(item => (
                            <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-3">
                              <Package className="h-4 w-4 text-slate-400 shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900">{item.producto.nombre}</p>
                                <p className="text-xs text-slate-400">{item.producto.codigo} · x{item.cantidad}</p>
                              </div>
                              <p className="text-sm font-bold text-slate-700">{formatCurrency(item.subtotal)}</p>
                            </div>
                          ))}
                          <div className="bg-white rounded-lg px-4 py-3 flex justify-between text-sm">
                            <span className="text-slate-500">Subtotal + IGV</span>
                            <div className="text-right">
                              <span className="font-bold text-slate-900">{formatCurrency(pedido.total)}</span>
                              <span className="text-slate-400 text-xs block">(IGV: {formatCurrency(pedido.igv)})</span>
                            </div>
                          </div>

                          {/* Status flow */}
                          <div className="bg-white rounded-lg px-4 py-3">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Cambiar estado</p>
                            <div className="flex gap-2 flex-wrap">
                              {STATUSES.filter(s => s !== "CANCELADO").map(s => (
                                <button
                                  key={s}
                                  disabled={s === pedido.status || updating === pedido.id}
                                  onClick={() => updateStatus(pedido.id, s)}
                                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                                    s === pedido.status
                                      ? "bg-blue-900 text-white"
                                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                  }`}
                                >
                                  {s.replace(/_/g, " ")}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
