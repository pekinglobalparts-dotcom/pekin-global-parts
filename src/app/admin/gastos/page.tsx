"use client";

import { useState, useEffect, useCallback } from "react";
import { Receipt, Trash2, AlertTriangle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const CATEGORIAS = ["Compra de stock", "Transporte / Envíos", "Publicidad", "Impuestos", "Otros"];

interface Gasto {
  id: string;
  fecha: string;
  categoria: string;
  monto: number;
  descripcion: string | null;
}

const hoy = () => new Date().toISOString().slice(0, 10);

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(hoy());
  const [descripcion, setDescripcion] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/gastos");
    if (r.status === 401) { setDenied(true); setLoading(false); return; }
    const d = await r.json();
    setGastos(d.gastos || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const guardar = async () => {
    const montoNum = parseFloat(monto);
    if (!montoNum || montoNum <= 0) { setError("Ingresa un monto válido."); return; }
    setSaving(true); setError("");
    try {
      const r = await fetch("/api/admin/gastos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoria, monto: montoNum, fecha, descripcion: descripcion || null }),
      });
      if (r.ok) {
        setMonto(""); setDescripcion(""); setFecha(hoy()); setCategoria(CATEGORIAS[0]);
        load();
      } else {
        setError("No se pudo guardar el gasto.");
      }
    } catch {
      setError("Error de conexión.");
    }
    setSaving(false);
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar este gasto?")) return;
    await fetch(`/api/admin/gastos/${id}`, { method: "DELETE" });
    setGastos(prev => prev.filter(g => g.id !== id));
  };

  if (denied) {
    return (
      <div className="p-8 text-center text-slate-500">
        <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-amber-400" />
        <p className="font-semibold text-slate-700">Acceso restringido</p>
        <p className="text-sm">Esta sección es solo para el Super Administrador.</p>
      </div>
    );
  }

  const totalMes = gastos
    .filter(g => new Date(g.fecha).getMonth() === new Date().getMonth() && new Date(g.fecha).getFullYear() === new Date().getFullYear())
    .reduce((s, g) => s + Number(g.monto), 0);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Receipt className="h-6 w-6 text-[#0f1f3d]" /> Gastos del negocio</h1>
        <p className="text-slate-500 text-sm mt-0.5">Registra tus gastos para ver tu <b>utilidad neta</b> real en Finanzas.</p>
      </div>

      {/* Formulario */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Categoría</label>
            <select value={categoria} onChange={e => setCategoria(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Monto</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">S/</span>
              <input type="number" min={0} step="0.01" value={monto} onChange={e => setMonto(e.target.value)}
                placeholder="0.00" className="w-full border border-slate-300 rounded-lg pl-7 pr-2 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Fecha</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Descripción (opcional)</label>
          <input value={descripcion} onChange={e => setDescripcion(e.target.value)}
            placeholder="Ej: Envío a Chorrillos / Compra de faros para stock"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        <button onClick={guardar} disabled={saving}
          className="w-full py-2.5 rounded-xl bg-[#0f1f3d] hover:bg-[#16294f] text-white text-sm font-bold disabled:opacity-40 transition-colors">
          {saving ? "Guardando…" : "Registrar gasto"}
        </button>
      </div>

      {/* Total del mes */}
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex items-center justify-between">
        <span className="text-sm text-slate-500 font-medium">Total de gastos este mes</span>
        <span className="text-xl font-black text-slate-900">{formatCurrency(totalMes)}</span>
      </div>

      {/* Listado */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-sm">Últimos gastos</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Cargando…</div>
        ) : gastos.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Aún no has registrado gastos.</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {gastos.map(g => (
              <div key={g.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {g.categoria}
                    {g.descripcion && <span className="text-slate-400 font-normal"> · {g.descripcion}</span>}
                  </p>
                  <p className="text-xs text-slate-400">{formatDate(g.fecha)}</p>
                </div>
                <span className="text-sm font-bold text-slate-700 shrink-0">{formatCurrency(g.monto)}</span>
                <button onClick={() => eliminar(g.id)} className="text-slate-300 hover:text-red-500 shrink-0"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
