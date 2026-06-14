"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCheck, FileText, ShoppingCart, CreditCard, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Notificacion {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  url: string | null;
  createdAt: string;
}

const tipoIcon: Record<string, typeof Bell> = {
  COTIZACION_RESPONDIDA: FileText,
  COTIZACION_NUEVA: FileText,
  PEDIDO_CONFIRMADO: ShoppingCart,
  PEDIDO_ENVIADO: ShoppingCart,
  FACTURA_EMITIDA: AlertCircle,
  CREDITO_ACTUALIZADO: CreditCard,
  SOLICITUD_APROBADA: CheckCheck,
};

const tipoColor: Record<string, string> = {
  COTIZACION_RESPONDIDA: "bg-green-50 text-green-600",
  COTIZACION_NUEVA: "bg-blue-50 text-blue-600",
  PEDIDO_CONFIRMADO: "bg-orange-50 text-orange-600",
  PEDIDO_ENVIADO: "bg-green-50 text-green-600",
  FACTURA_EMITIDA: "bg-amber-50 text-amber-600",
  CREDITO_ACTUALIZADO: "bg-purple-50 text-purple-600",
  SOLICITUD_APROBADA: "bg-green-50 text-green-600",
};

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetch("/api/socio/notificaciones")
      .then(r => r.json())
      .then(d => { setNotificaciones(d.notificaciones || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    setMarking(true);
    await fetch("/api/socio/notificaciones", { method: "PATCH" });
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
    setMarking(false);
  };

  const unread = notificaciones.filter(n => !n.leida).length;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Notificaciones</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {unread > 0 ? `${unread} sin leer` : "Todo al día"}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            disabled={marking}
            className="flex items-center gap-2 text-sm font-medium text-blue-900 hover:text-blue-700 disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            Marcar todas como leídas
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : notificaciones.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Bell className="h-16 w-16 mx-auto mb-4 text-slate-200" />
          <p className="font-semibold text-slate-600 text-lg">Sin notificaciones</p>
          <p className="text-sm mt-1">Aquí aparecerán sus actualizaciones</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notificaciones.map((n, i) => {
            const Icon = tipoIcon[n.tipo] || Bell;
            const colorClass = tipoColor[n.tipo] || "bg-slate-50 text-slate-500";
            const Wrapper = n.url ? "a" : "div";
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Wrapper
                  {...(n.url ? { href: n.url } : {})}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                    !n.leida
                      ? "bg-blue-50/60 border-blue-100 hover:bg-blue-50"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  } ${n.url ? "cursor-pointer" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${!n.leida ? "text-slate-900" : "text-slate-700"}`}>
                        {n.titulo}
                      </p>
                      {!n.leida && (
                        <span className="w-2 h-2 rounded-full bg-blue-900 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.mensaje}</p>
                    <p className="text-xs text-slate-400 mt-1">{formatDate(n.createdAt)}</p>
                  </div>
                </Wrapper>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
