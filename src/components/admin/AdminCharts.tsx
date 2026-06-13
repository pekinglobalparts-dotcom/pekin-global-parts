"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface Metrics {
  sociosPorSector: { sector: string; count: number }[];
  sociosPorMes: { mes: string; socios: number }[];
  topProductos: { nombre: string; count: number }[];
  pedidosPorStatus: { status: string; count: number }[];
  totalFacturado: number;
  totalPendienteCobro: number;
}

// Colores de la marca PEKIN
const BRAND_COLORS = ["#1e3a8a", "#dc2626", "#1d4ed8", "#991b1b", "#3b82f6", "#b91c1c"];

const PEDIDO_COLORS: Record<string, string> = {
  PENDIENTE: "#f59e0b",
  CONFIRMADO: "#3b82f6",
  EN_PROCESO: "#8b5cf6",
  ENVIADO: "#10b981",
  ENTREGADO: "#059669",
  CANCELADO: "#ef4444",
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name?: string; fill?: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-xl">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.fill || "#fff" }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AdminCharts() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"socios" | "pedidos" | "productos">("socios");

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then(r => r.json())
      .then(d => { setMetrics(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center h-64">
          <div className="text-slate-400 text-sm animate-pulse">Cargando métricas...</div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-4">
      {/* Bar: socios por mes */}
      <Card>
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-900" />
          <h3 className="font-bold text-slate-900 text-sm">Nuevos socios (últimos 6 meses)</h3>
        </div>
        <CardContent className="p-5">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={metrics.sociosPorMes} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="socios" name="Socios" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabs: sector / pedidos / productos */}
      <Card>
        <div className="p-5 border-b border-slate-100">
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
            {(["socios", "pedidos", "productos"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                  activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab === "socios" ? "Por sector" : tab === "pedidos" ? "Pedidos" : "Top productos"}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-5">
          {activeTab === "socios" && (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie
                    data={metrics.sociosPorSector}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={35}
                    dataKey="count"
                    nameKey="sector"
                    paddingAngle={3}
                  >
                    {metrics.sociosPorSector.map((_, i) => (
                      <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val} socios`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {metrics.sociosPorSector.map((s, i) => (
                  <div key={s.sector} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: BRAND_COLORS[i % BRAND_COLORS.length] }}
                    />
                    <span className="text-xs text-slate-600 flex-1 truncate">{s.sector}</span>
                    <span className="text-xs font-bold text-slate-900">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "pedidos" && (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie
                    data={metrics.pedidosPorStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={35}
                    dataKey="count"
                    nameKey="status"
                    paddingAngle={3}
                  >
                    {metrics.pedidosPorStatus.map((p, i) => (
                      <Cell key={i} fill={PEDIDO_COLORS[p.status] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val} pedidos`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {metrics.pedidosPorStatus.map((p) => (
                  <div key={p.status} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PEDIDO_COLORS[p.status] || "#94a3b8" }}
                    />
                    <span className="text-xs text-slate-600 flex-1">{p.status.replace(/_/g, " ")}</span>
                    <span className="text-xs font-bold text-slate-900">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "productos" && (
            <div className="space-y-3">
              {metrics.topProductos.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">Sin datos aún</p>
              ) : (
                metrics.topProductos.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-300 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{p.nombre}</p>
                      <div className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-blue-900 to-red-600 transition-all"
                          style={{ width: `${Math.min((p.count / (metrics.topProductos[0]?.count || 1)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-600 shrink-0">{p.count}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
