"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, ChevronDown, ChevronUp, CheckCircle, Clock, X } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Factura {
  id: string;
  numero: string;
  status: string;
  total: number;
  subtotal: number;
  igv: number;
  fechaVencimiento: string | null;
  createdAt: string;
  socio: { razonSocial: string; ruc: string; emailCorporativo: string };
  pedido: { numero: string } | null;
}

const statusVariant: Record<string, "warning" | "success" | "destructive" | "secondary"> = {
  PENDIENTE: "warning",
  PAGADA: "success",
  VENCIDA: "destructive",
  ANULADA: "secondary",
};

const FILTERS = ["TODOS", "PENDIENTE", "PAGADA", "VENCIDA"];

export default function AdminFacturasPage() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("TODOS");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [totalPendiente, setTotalPendiente] = useState(0);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const params = filter !== "TODOS" ? `?status=${filter}` : "";
    const res = await fetch(`/api/admin/facturas${params}`);
    const data = await res.json();
    setFacturas(data.facturas || []);
    setTotalPendiente(data.totalPendiente || 0);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const markPagada = async (id: string) => {
    setUpdating(id);
    await fetch(`/api/admin/facturas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAGADA" }),
    });
    setFacturas(prev => prev.map(f => f.id === id ? { ...f, status: "PAGADA" } : f));
    setUpdating(null);
  };

  const markAnulada = async (id: string) => {
    setUpdating(id);
    await fetch(`/api/admin/facturas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ANULADA" }),
    });
    setFacturas(prev => prev.map(f => f.id === id ? { ...f, status: "ANULADA" } : f));
    setUpdating(null);
  };

  const totalFacturas = facturas.reduce((sum, f) => sum + Number(f.total), 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Facturas</h1>
        <p className="text-slate-500 text-sm mt-0.5">Control de facturación y cobros</p>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-xs text-slate-400 mb-1">Total en vista</p>
            <p className="text-2xl font-black text-slate-900">{formatCurrency(totalFacturas)}</p>
          </div>
          <div className={`border rounded-2xl p-5 ${totalPendiente > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"}`}>
            <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Pendiente de cobro
            </p>
            <p className={`text-2xl font-black ${totalPendiente > 0 ? "text-amber-700" : "text-slate-900"}`}>
              {formatCurrency(totalPendiente)}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === f ? "bg-[#0f1f3d] text-white" : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Cargando...</div>
        ) : facturas.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No hay facturas en este estado</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {facturas.map(factura => (
              <div key={factura.id}>
                <div
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setExpanded(expanded === factura.id ? null : factura.id)}
                >
                  <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                    <Receipt className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{factura.numero}</span>
                      <Badge variant={statusVariant[factura.status] || "secondary"}>
                        {factura.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {factura.socio.razonSocial}
                      {factura.fechaVencimiento && ` · Vence: ${formatDate(factura.fechaVencimiento)}`}
                      {factura.pedido && ` · Pedido: ${factura.pedido.numero}`}
                    </p>
                  </div>
                  <span className="font-bold text-blue-900 text-sm shrink-0">{formatCurrency(factura.total)}</span>

                  {factura.status === "PENDIENTE" && (
                    <Button
                      size="sm"
                      variant="outline"
                      loading={updating === factura.id}
                      onClick={e => { e.stopPropagation(); markPagada(factura.id); }}
                      className="shrink-0 text-green-700 border-green-200 hover:bg-green-50"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Marcar pagada
                    </Button>
                  )}

                  {expanded === factura.id
                    ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                </div>

                <AnimatePresence>
                  {expanded === factura.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-50"
                    >
                      <div className="p-4 bg-slate-50 space-y-3">
                        <div className="bg-white rounded-xl p-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Empresa</span>
                            <span className="font-semibold text-slate-900">{factura.socio.razonSocial}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">RUC</span>
                            <span className="text-slate-700">{factura.socio.ruc}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Email</span>
                            <span className="text-slate-700">{factura.socio.emailCorporativo}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Emitida</span>
                            <span className="text-slate-700">{formatDate(factura.createdAt)}</span>
                          </div>
                          {factura.fechaVencimiento && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Vencimiento</span>
                              <span className={`font-semibold ${factura.status === "VENCIDA" ? "text-red-600" : "text-slate-700"}`}>
                                {formatDate(factura.fechaVencimiento)}
                              </span>
                            </div>
                          )}
                          <div className="border-t border-slate-100 pt-2 mt-2 space-y-1">
                            <div className="flex justify-between text-xs text-slate-400">
                              <span>Subtotal</span>
                              <span>{formatCurrency(factura.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-400">
                              <span>IGV (18%)</span>
                              <span>{formatCurrency(factura.igv)}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span className="text-slate-900">Total</span>
                              <span className="text-blue-900">{formatCurrency(factura.total)}</span>
                            </div>
                          </div>
                        </div>

                        {factura.status !== "PAGADA" && factura.status !== "ANULADA" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              loading={updating === factura.id}
                              onClick={() => markPagada(factura.id)}
                              className="flex-1"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Confirmar pago
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              loading={updating === factura.id}
                              onClick={() => markAnulada(factura.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-3.5 w-3.5" />
                              Anular
                            </Button>
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
    </div>
  );
}
