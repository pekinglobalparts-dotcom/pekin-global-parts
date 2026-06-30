"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Movimiento {
  id: string;
  tipo: string;
  monto: number;
  saldoAntes: number;
  saldoDespues: number;
  descripcion: string;
  createdAt: string;
}

const tipoConfig: Record<string, { label: string; color: string; icon: typeof ArrowUpRight }> = {
  CREDITO_ASIGNADO: { label: "Crédito asignado", color: "text-green-600", icon: ArrowUpRight },
  CREDITO_UTILIZADO: { label: "Crédito utilizado", color: "text-red-600", icon: ArrowDownRight },
  CREDITO_LIBERADO: { label: "Crédito liberado", color: "text-blue-600", icon: ArrowUpRight },
  PAGO_RECIBIDO: { label: "Pago recibido", color: "text-green-600", icon: ArrowUpRight },
};

export default function CreditoPage() {
  const [data, setData] = useState<{ socio: { lineaCredito: number; creditoUtilizado: number; tipoPago?: string; plazoCredito?: number } | null; movimientos: Movimiento[] }>({
    socio: null, movimientos: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/socio/credito")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const tipoPago = data.socio?.tipoPago ?? "CREDITO";
  const plazoCredito = data.socio?.plazoCredito ?? 30;
  const lineaCredito = Number(data.socio?.lineaCredito || 0);
  const creditoUtilizado = Number(data.socio?.creditoUtilizado || 0);
  const creditoDisponible = lineaCredito - creditoUtilizado;
  const usagePercent = lineaCredito > 0 ? (creditoUtilizado / lineaCredito) * 100 : 0;

  if (!loading && tipoPago === "CONTADO") {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900">Modalidad de pago</h1>
        </div>
        <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-8 text-white max-w-lg">
          <p className="text-green-100 text-sm font-semibold uppercase tracking-wide mb-2">Cuenta al contado</p>
          <p className="text-xl font-bold mt-1">Pago por transferencia o link antes del despacho</p>
          <p className="text-green-100 text-sm mt-3 leading-relaxed">
            Sus pedidos se confirman al verificar el pago. Contáctenos por WhatsApp para coordinar la transferencia o el envío del link de pago.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Línea de crédito</h1>
        <p className="text-slate-500 text-sm mt-0.5">Estado y movimientos · Plazo {plazoCredito} días</p>
      </div>

      {/* Credit summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-3 bg-gradient-to-r from-blue-950 to-blue-900 rounded-2xl p-6 text-white"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div>
              <p className="text-blue-200 text-sm mb-1">Línea total</p>
              <p className="text-2xl sm:text-3xl font-black">{loading ? "..." : formatCurrency(lineaCredito)}</p>
            </div>
            <div>
              <p className="text-blue-200 text-sm mb-1">Utilizado</p>
              <p className="text-2xl sm:text-3xl font-black text-red-300">{loading ? "..." : formatCurrency(creditoUtilizado)}</p>
            </div>
            <div>
              <p className="text-blue-200 text-sm mb-1">Disponible</p>
              <p className="text-2xl sm:text-3xl font-black text-green-300">{loading ? "..." : formatCurrency(creditoDisponible)}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(usagePercent, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                className={`h-3 rounded-full ${
                  usagePercent >= 90 ? "bg-red-400" :
                  usagePercent >= 70 ? "bg-amber-400" :
                  "bg-green-400"
                }`}
              />
            </div>
            <div className="flex justify-between text-xs text-blue-200 mt-1.5">
              <span>{usagePercent.toFixed(1)}% utilizado</span>
              <span>{(100 - usagePercent).toFixed(1)}% disponible</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Movements */}
      <h2 className="text-lg font-bold text-slate-900 mb-4">Historial de movimientos</h2>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
        </div>
      ) : data.movimientos.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <CreditCard className="h-12 w-12 mx-auto mb-3 text-slate-200" />
          <p className="text-slate-500">Sin movimientos registrados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.movimientos.map((mov, i) => {
            const cfg = tipoConfig[mov.tipo] || { label: mov.tipo, color: "text-slate-600", icon: ArrowUpRight };
            const esPositivo = ["CREDITO_ASIGNADO", "CREDITO_LIBERADO", "PAGO_RECIBIDO"].includes(mov.tipo);
            return (
              <motion.div
                key={mov.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  esPositivo ? "bg-green-50" : "bg-red-50"
                }`}>
                  <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{cfg.label}</p>
                  <p className="text-xs text-slate-400 truncate">{mov.descripcion}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-bold text-sm ${cfg.color}`}>
                    {esPositivo ? "+" : "-"}{formatCurrency(mov.monto)}
                  </p>
                  <p className="text-xs text-slate-400">{formatDate(mov.createdAt)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
