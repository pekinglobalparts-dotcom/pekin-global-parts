"use client";

import { useState, useEffect } from "react";
import { Trash2, AlertTriangle, Check, RefreshCw } from "lucide-react";

interface Socio {
  id: string;
  razonSocial: string;
  ruc: string;
  emailCorporativo: string;
}

interface Counts {
  socios: number;
  solicitudes: number;
  pedidos: number;
  facturas: number;
  cotizaciones: number;
  notificaciones: number;
  movimientosCredito: number;
}

export default function DatosPage() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [selectedSocios, setSelectedSocios] = useState<Set<string>>(new Set());
  const [opts, setOpts] = useState({
    solicitudes: false,
    solicitudesStatus: [] as string[],
    pedidos: false,
    facturas: false,
    cotizaciones: false,
    notificaciones: false,
    movimientosCredito: false,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [confirm, setConfirm] = useState(false);

  const loadData = async () => {
    const [sociosRes, countsRes] = await Promise.all([
      fetch("/api/admin/socios?limit=100").then(r => r.json()),
      fetch("/api/admin/reset/counts").then(r => r.json()),
    ]);
    setSocios(sociosRes.socios || []);
    setCounts(countsRes);
  };

  useEffect(() => { loadData(); }, []);

  const toggleSocio = (id: string) => {
    setSelectedSocios(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    setSelectedSocios(prev => prev.size === socios.length ? new Set() : new Set(socios.map(s => s.id)));
  };

  const toggleSolicitudStatus = (s: string) => {
    setOpts(prev => ({
      ...prev,
      solicitudesStatus: prev.solicitudesStatus.includes(s)
        ? prev.solicitudesStatus.filter(x => x !== s)
        : [...prev.solicitudesStatus, s],
    }));
  };

  const hasSelection = selectedSocios.size > 0 || opts.solicitudes ||
    opts.pedidos || opts.facturas || opts.cotizaciones ||
    opts.notificaciones || opts.movimientosCredito;

  const handleReset = async () => {
    if (!hasSelection || !confirm) return;
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/admin/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...opts,
        socioIds: selectedSocios.size > 0 ? [...selectedSocios] : undefined,
      }),
    });
    const data = await res.json();
    if (data.ok) {
      setResult(data.deleted);
      setSelectedSocios(new Set());
      setOpts({ solicitudes: false, solicitudesStatus: [], pedidos: false, facturas: false, cotizaciones: false, notificaciones: false, movimientosCredito: false });
      setConfirm(false);
      loadData();
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Gestión de datos</h1>
        <p className="text-slate-500 text-sm mt-1">Elimina datos de prueba de forma selectiva. El catálogo y el usuario admin nunca se borran.</p>
      </div>

      {/* Counters */}
      {counts && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            ["Socios", counts.socios],
            ["Solicitudes", counts.solicitudes],
            ["Pedidos", counts.pedidos],
            ["Facturas", counts.facturas],
            ["Cotizaciones", counts.cotizaciones],
            ["Notificaciones", counts.notificaciones],
          ].map(([label, val]) => (
            <div key={label as string} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-2xl font-black text-slate-900">{val}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-6">
        {/* Socios */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Socios</h2>
              <p className="text-xs text-slate-500 mt-0.5">Al eliminar un socio se borran también sus pedidos, facturas, cotizaciones, notificaciones y movimientos.</p>
            </div>
            <button onClick={toggleAll} className="text-xs text-blue-700 font-semibold hover:underline">
              {selectedSocios.size === socios.length ? "Deseleccionar todos" : "Seleccionar todos"}
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {socios.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-400">No hay socios registrados</p>
            ) : socios.map(s => (
              <label key={s.id} className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={selectedSocios.has(s.id)}
                  onChange={() => toggleSocio(s.id)}
                  className="w-4 h-4 rounded accent-red-600"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900">{s.razonSocial}</div>
                  <div className="text-xs text-slate-400">{s.ruc} · {s.emailCorporativo}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Solicitudes */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <input type="checkbox" checked={opts.solicitudes} onChange={e => setOpts(p => ({ ...p, solicitudes: e.target.checked }))} className="w-4 h-4 rounded accent-red-600" />
            <div>
              <h2 className="font-bold text-slate-900">Solicitudes de afiliación</h2>
              <p className="text-xs text-slate-500 mt-0.5">Filtra por estado o borra todas</p>
            </div>
          </div>
          {opts.solicitudes && (
            <div className="px-5 py-4 flex gap-2 flex-wrap">
              {["PENDIENTE", "EN_REVISION", "APROBADA", "RECHAZADA"].map(s => (
                <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={opts.solicitudesStatus.includes(s)}
                    onChange={() => toggleSolicitudStatus(s)}
                    className="w-4 h-4 rounded accent-red-600"
                  />
                  {s}
                </label>
              ))}
              <span className="text-xs text-slate-400 self-center ml-1">(sin selección = todas)</span>
            </div>
          )}
        </div>

        {/* Transaccionales independientes */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Datos transaccionales</h2>
            <p className="text-xs text-slate-500 mt-0.5">Solo si no seleccionaste socios arriba (para borrarlos sin tocar los socios)</p>
          </div>
          <div className="divide-y divide-slate-50">
            {[
              { key: "pedidos", label: "Pedidos", desc: "Todos los pedidos del sistema" },
              { key: "facturas", label: "Facturas", desc: "Todas las facturas" },
              { key: "cotizaciones", label: "Cotizaciones", desc: "Todas las cotizaciones" },
              { key: "notificaciones", label: "Notificaciones", desc: "Todas las notificaciones" },
              { key: "movimientosCredito", label: "Movimientos de crédito", desc: "Historial de crédito" },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={opts[key as keyof typeof opts] as boolean}
                  onChange={e => setOpts(p => ({ ...p, [key]: e.target.checked }))}
                  className="w-4 h-4 rounded accent-red-600"
                />
                <div>
                  <div className="text-sm font-medium text-slate-900">{label}</div>
                  <div className="text-xs text-slate-400">{desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-3">
            <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-800 text-sm">Datos eliminados correctamente</p>
              <ul className="mt-1 text-xs text-green-700 space-y-0.5">
                {Object.entries(result).filter(([, v]) => v > 0).map(([k, v]) => (
                  <li key={k}>{k}: {v} registros</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Confirm + Execute */}
        {hasSelection && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-800 text-sm">Esta acción no se puede deshacer</p>
                <p className="text-xs text-red-600 mt-0.5">
                  {selectedSocios.size > 0 && `${selectedSocios.size} socio(s) y todos sus datos asociados. `}
                  {opts.solicitudes && "Solicitudes. "}
                  {opts.pedidos && "Pedidos. "}
                  {opts.facturas && "Facturas. "}
                  {opts.cotizaciones && "Cotizaciones. "}
                  {opts.notificaciones && "Notificaciones. "}
                  {opts.movimientosCredito && "Movimientos de crédito. "}
                </p>
              </div>
            </div>
            <label className="flex items-center gap-3 mb-4 cursor-pointer">
              <input type="checkbox" checked={confirm} onChange={e => setConfirm(e.target.checked)} className="w-4 h-4 rounded accent-red-600" />
              <span className="text-sm font-semibold text-red-800">Confirmo que quiero eliminar estos datos permanentemente</span>
            </label>
            <button
              onClick={handleReset}
              disabled={!confirm || loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {loading ? "Eliminando..." : "Eliminar selección"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
