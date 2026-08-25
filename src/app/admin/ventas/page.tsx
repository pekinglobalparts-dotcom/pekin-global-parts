"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Store, AlertTriangle, Copy, Check } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Linea { descripcion: string; codigo: string; cantidad: number; precioUnit: number; costoUnit: number }
interface Venta {
  id: string;
  numero: string;
  cliente: string | null;
  docCliente: string | null;
  modalidad: string;
  fecha: string;
  total: number;
  costoTotal: number;
  ganancia: number;
  items: Linea[];
  notas: string | null;
}

const nuevaLinea = (): Linea => ({ descripcion: "", codigo: "", cantidad: 1, precioUnit: 0, costoUnit: 0 });
const hoy = () => new Date().toISOString().slice(0, 10);

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  const [cliente, setCliente] = useState("");
  const [docCliente, setDocCliente] = useState("");
  const [modalidad, setModalidad] = useState<"CONTADO" | "CREDITO">("CONTADO");
  const [fecha, setFecha] = useState(hoy());
  const [notas, setNotas] = useState("");
  const [items, setItems] = useState<Linea[]>([nuevaLinea()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copiado, setCopiado] = useState<string>("");

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/ventas");
    if (r.status === 401) { setDenied(true); setLoading(false); return; }
    const d = await r.json();
    setVentas(d.ventas || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addItem = () => setItems(p => [...p, nuevaLinea()]);
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));
  const updateItem = (i: number, f: keyof Linea, v: string | number) =>
    setItems(p => p.map((it, idx) => idx === i ? { ...it, [f]: v } : it));

  const total = items.reduce((s, i) => s + i.precioUnit * i.cantidad, 0);
  const costoTotal = items.reduce((s, i) => s + i.costoUnit * i.cantidad, 0);
  const ganancia = total - costoTotal;
  const valido = items.every(i => i.descripcion.trim() !== "" && i.cantidad >= 1);

  const guardar = async () => {
    if (!valido) return;
    setSaving(true);
    setError("");
    try {
      const r = await fetch("/api/admin/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cliente: cliente || null, docCliente: docCliente || null, modalidad, fecha, items, notas: notas || null }),
      });
      if (r.ok) {
        setCliente(""); setDocCliente(""); setModalidad("CONTADO"); setNotas(""); setItems([nuevaLinea()]); setFecha(hoy());
        load();
      } else {
        const d = await r.json().catch(() => ({}));
        setError(d.error || "No se pudo guardar la venta.");
      }
    } catch {
      setError("Error de conexión.");
    }
    setSaving(false);
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar esta venta?")) return;
    await fetch(`/api/admin/ventas/${id}`, { method: "DELETE" });
    setVentas(prev => prev.filter(v => v.id !== id));
  };

  // Texto simple para enviarle al contador por WhatsApp
  const textoVenta = (v: Venta): string => {
    const L = [];
    L.push(`🧾 ${v.numero} · ${formatDate(v.fecha)} · ${v.modalidad === "CREDITO" ? "CRÉDITO" : "CONTADO"}`);
    L.push(`Cliente: ${v.cliente || "Mostrador"}${v.docCliente ? ` · DNI/RUC: ${v.docCliente}` : ""}`);
    for (const it of v.items || []) {
      L.push(`• ${it.descripcion}${it.codigo ? ` (${it.codigo})` : ""} x${it.cantidad} — ${formatCurrency(it.precioUnit)} c/u`);
    }
    L.push(`TOTAL: ${formatCurrency(v.total)} (inc. IGV)`);
    return L.join("\n");
  };

  const copiar = async (texto: string, id: string) => {
    try { await navigator.clipboard.writeText(texto); setCopiado(id); setTimeout(() => setCopiado(""), 2000); }
    catch { alert("No se pudo copiar. Selecciona y copia manualmente:\n\n" + texto); }
  };

  const copiarDia = () => {
    const h = hoy();
    const delDia = ventas.filter(v => v.fecha.slice(0, 10) === h);
    if (delDia.length === 0) { alert("No hay ventas registradas hoy."); return; }
    const totalDia = delDia.reduce((s, v) => s + Number(v.total), 0);
    const texto = `📋 VENTAS DEL DÍA — PEKIN GLOBAL PARTS\n${formatDate(h)} · ${delDia.length} venta(s)\n\n`
      + delDia.map(textoVenta).join("\n\n——————————\n")
      + `\n\n══════════\nTOTAL DEL DÍA: ${formatCurrency(totalDia)}`;
    copiar(texto, "dia");
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

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Store className="h-6 w-6 text-[#0f1f3d]" /> Ventas de mostrador</h1>
        <p className="text-slate-500 text-sm mt-0.5">Registra las ventas de contado / clientes finales que no están en el sistema. Pon los montos <b>con IGV incluido</b> (lo que cobras y lo que pagas, tal cual). Ganancia = venta − costo.</p>
      </div>

      {/* Formulario */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Cliente (opcional)</label>
            <input value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Nombre o referencia"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">DNI / RUC (opcional)</label>
            <input value={docCliente} onChange={e => setDocCliente(e.target.value)} placeholder="Para la boleta/factura del contador"
              inputMode="numeric" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Modalidad de pago</label>
            <select value={modalidad} onChange={e => setModalidad(e.target.value as "CONTADO" | "CREDITO")}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="CONTADO">Contado</option>
              <option value="CREDITO">Crédito</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Fecha</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Repuestos vendidos</label>
            <button onClick={addItem} className="flex items-center gap-1 text-xs text-blue-700 font-semibold hover:underline">
              <Plus className="h-3.5 w-3.5" /> Agregar línea
            </button>
          </div>
          <div className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end border border-slate-100 rounded-xl p-2">
                <div className="col-span-12 sm:col-span-5">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Descripción</label>
                  <input value={it.descripcion} onChange={e => updateItem(i, "descripcion", e.target.value)}
                    placeholder="Ej: Pastillas de freno Hilux" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Código</label>
                  <input value={it.codigo} onChange={e => updateItem(i, "codigo", e.target.value)}
                    placeholder="Opc." className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm" />
                </div>
                <div className="col-span-6 sm:col-span-1">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Cant.</label>
                  <input type="number" min={1} value={it.cantidad} onChange={e => updateItem(i, "cantidad", parseInt(e.target.value) || 1)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm text-center" />
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Precio venta (con IGV)</label>
                  <input type="number" min={0} step="0.01" value={it.precioUnit} onChange={e => updateItem(i, "precioUnit", parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm" />
                </div>
                <div className="col-span-5 sm:col-span-1">
                  <label className="block text-[10px] font-semibold text-emerald-600 uppercase mb-0.5">Costo (con IGV)</label>
                  <input type="number" min={0} step="0.01" value={it.costoUnit} onChange={e => updateItem(i, "costoUnit", parseFloat(e.target.value) || 0)}
                    className="w-full border border-emerald-200 bg-emerald-50/40 rounded-lg px-2 py-2 text-sm" />
                </div>
                <div className="col-span-1 flex justify-center pb-2">
                  {items.length > 1 && (
                    <button onClick={() => removeItem(i)} className="text-slate-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Notas (opcional)</label>
          <input value={notas} onChange={e => setNotas(e.target.value)} placeholder="Cualquier detalle"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 rounded-xl px-4 py-3">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Venta</p>
            <p className="text-lg font-black text-slate-900">{formatCurrency(total)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl px-4 py-3">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Costo</p>
            <p className="text-lg font-black text-slate-500">{formatCurrency(costoTotal)}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl px-4 py-3">
            <p className="text-[11px] text-emerald-500 uppercase font-semibold">Ganancia</p>
            <p className="text-lg font-black text-emerald-700">{formatCurrency(ganancia)}</p>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        <button onClick={guardar} disabled={!valido || saving}
          className="w-full py-2.5 rounded-xl bg-[#0f1f3d] hover:bg-[#16294f] text-white text-sm font-bold disabled:opacity-40 transition-colors">
          {saving ? "Guardando…" : "Registrar venta"}
        </button>
      </div>

      {/* Listado */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
          <h2 className="font-bold text-slate-900 text-sm">Últimas ventas registradas</h2>
          <button onClick={copiarDia}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 transition-colors">
            {copiado === "dia" ? <><Check className="h-3.5 w-3.5 text-emerald-600" /> ¡Copiado!</> : <><Copy className="h-3.5 w-3.5" /> Copiar ventas de hoy (contador)</>}
          </button>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Cargando…</div>
        ) : ventas.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Aún no has registrado ventas de mostrador.</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {ventas.map(v => (
              <div key={v.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate flex items-center gap-2">
                    {v.cliente || "Cliente de mostrador"}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${v.modalidad === "CREDITO" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {v.modalidad === "CREDITO" ? "CRÉDITO" : "CONTADO"}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400">{v.numero} · {formatDate(v.fecha)} · {v.items?.length || 0} ítem(s){v.docCliente ? ` · ${v.docCliente}` : ""}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(v.total)}</p>
                  <p className="text-xs text-emerald-600">Ganó {formatCurrency(v.ganancia)}</p>
                </div>
                <button onClick={() => copiar(textoVenta(v), v.id)} title="Copiar para el contador"
                  className="text-slate-400 hover:text-blue-600 shrink-0 p-1">
                  {copiado === v.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
                <button onClick={() => eliminar(v.id)} className="text-slate-300 hover:text-red-500 shrink-0 p-1"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
