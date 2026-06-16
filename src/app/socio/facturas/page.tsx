"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Receipt, Download, AlertCircle, CheckCircle, Clock, MessageCircle } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Factura {
  id: string;
  numero: string;
  numeroReal?: string;
  status: string;
  total: number;
  subtotal: number;
  igv: number;
  fechaVencimiento: string;
  pdfUrl: string | null;
  pagadoAt: string | null;
  createdAt: string;
  pedido: { numero: string };
}

const statusConfig: Record<string, { label: string; variant: "warning" | "success" | "destructive" | "secondary"; icon: typeof Receipt }> = {
  PENDIENTE: { label: "Pendiente de pago", variant: "warning", icon: Clock },
  PAGADA: { label: "Pagada", variant: "success", icon: CheckCircle },
  VENCIDA: { label: "Vencida", variant: "destructive", icon: AlertCircle },
  ANULADA: { label: "Anulada", variant: "secondary", icon: Receipt },
};

export default function FacturasPage() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/socio/facturas")
      .then(r => r.json())
      .then(data => { setFacturas(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalPendiente = facturas
    .filter(f => f.status === "PENDIENTE")
    .reduce((sum, f) => sum + f.total, 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Mis facturas</h1>
        <p className="text-slate-500 text-sm mt-0.5">{facturas.length} facturas registradas</p>
      </div>

      {totalPendiente > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">
              Saldo pendiente de pago
            </p>
            <p className="text-amber-700 font-black text-xl">{formatCurrency(totalPendiente)}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
        </div>
      ) : facturas.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Receipt className="h-16 w-16 mx-auto mb-4 text-slate-200" />
          <p className="font-semibold text-slate-600 text-lg">Sin facturas aún</p>
        </div>
      ) : (
        <div className="space-y-3">
          {facturas.map((factura, i) => {
            const cfg = statusConfig[factura.status] || statusConfig.PENDIENTE;
            return (
              <motion.div
                key={factura.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                  <cfg.icon className="h-5 w-5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">
                      {factura.numeroReal || factura.numero}
                    </span>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    Pedido: {factura.pedido.numero} · Emitida: {formatDate(factura.createdAt)}
                  </p>
                  <p className="text-xs text-slate-400">
                    Vencimiento: {formatDate(factura.fechaVencimiento)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-blue-900">{formatCurrency(factura.total)}</p>
                  <p className="text-xs text-slate-400">Inc. IGV</p>
                </div>
                {factura.pdfUrl && (
                  <div className="flex flex-col gap-1 shrink-0">
                    <a href={`/api/facturas/${factura.id}/pdf`} target="_blank" rel="noopener noreferrer"
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Descargar PDF">
                      <Download className="h-4 w-4 text-blue-600" />
                    </a>
                    <a href={`https://wa.me/?text=${encodeURIComponent(`Factura ${factura.numeroReal || factura.numero} por S/ ${Number(factura.total).toFixed(2)} Inc. IGV - Pekin Global Parts`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="p-2 hover:bg-green-50 rounded-lg transition-colors" title="Compartir por WhatsApp">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                    </a>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
