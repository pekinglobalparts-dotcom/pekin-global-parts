"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";
import { Plus, Trash2, Store, AlertTriangle, Copy, Check, Pencil, Tags, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const conMargen = (socio: number, pct: number) =>
  socio > 0 ? (Math.round(socio * (1 + pct / 100) * 100) / 100).toFixed(2) : "";

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

  // Publicar al catálogo
  const [pubVenta, setPubVenta] = useState<Venta | null>(null);
  const [pubForm, setPubForm] = useState({ descripcion: "", codigo: "", precioSocio: "", precioPublico: "", imagenUrl: "" });
  const [pubSaving, setPubSaving] = useState(false);
  const [pubError, setPubError] = useState("");
  const [pubOk, setPubOk] = useState(false);

  // Editar venta
  const [editVenta, setEditVenta] = useState<Venta | null>(null);
  const [eCliente, setECliente] = useState("");
  const [eDoc, setEDoc] = useState("");
  const [eModalidad, setEModalidad] = useState<"CONTADO" | "CREDITO">("CONTADO");
  const [eFecha, setEFecha] = useState(hoy());
  const [eNotas, setENotas] = useState("");
  const [eItems, setEItems] = useState<Linea[]>([nuevaLinea()]);
  const [eSaving, setESaving] = useState(false);
  const [eError, setEError] = useState("");

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

  // ── Publicar al catálogo ──
  const abrirPublicar = (v: Venta) => {
    const its = v.items || [];
    const desc = its.length === 1 ? its[0].descripcion : (its[0]?.descripcion || v.cliente || "Repuesto");
    const socio = its.length === 1 ? Number(its[0].precioUnit) : Number(v.total);
    setPubVenta(v);
    setPubForm({
      descripcion: desc,
      codigo: its[0]?.codigo || "",
      precioSocio: socio ? String(socio) : "",
      precioPublico: conMargen(socio, 15),
      imagenUrl: "",
    });
    setPubError(""); setPubOk(false);
  };

  const publicar = async () => {
    if (!pubForm.descripcion.trim() || !pubForm.precioSocio || !pubForm.precioPublico) {
      setPubError("Completa la descripción y ambos precios."); return;
    }
    setPubSaving(true); setPubError("");
    try {
      const r = await fetch("/api/admin/vitrina", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcion: pubForm.descripcion.trim(),
          codigo: pubForm.codigo.trim() || null,
          imagenUrl: pubForm.imagenUrl || null,
          precioSocio: parseFloat(pubForm.precioSocio),
          precioPublico: parseFloat(pubForm.precioPublico),
          origen: "mostrador",
          origenId: pubVenta?.id || null,
        }),
      });
      if (r.ok) { setPubOk(true); setTimeout(() => setPubVenta(null), 1200); }
      else { const d = await r.json().catch(() => ({})); setPubError(d.error || "No se pudo publicar."); }
    } catch { setPubError("Error de conexión."); }
    setPubSaving(false);
  };

  // ── Editar venta ──
  const abrirEditar = (v: Venta) => {
    setEditVenta(v);
    setECliente(v.cliente || "");
    setEDoc(v.docCliente || "");
    setEModalidad(v.modalidad === "CREDITO" ? "CREDITO" : "CONTADO");
    setEFecha(v.fecha.slice(0, 10));
    setENotas(v.notas || "");
    setEItems((v.items || []).map(i => ({
      descripcion: i.descripcion, codigo: i.codigo || "",
      cantidad: Number(i.cantidad), precioUnit: Number(i.precioUnit), costoUnit: Number(i.costoUnit),
    })) || [nuevaLinea()]);
    setEError("");
  };
  const eAddItem = () => setEItems(p => [...p, nuevaLinea()]);
  const eRemoveItem = (i: number) => setEItems(p => p.filter((_, idx) => idx !== i));
  const eUpdateItem = (i: number, f: keyof Linea, v: string | number) =>
    setEItems(p => p.map((it, idx) => idx === i ? { ...it, [f]: v } : it));

  const guardarEdicion = async () => {
    if (!editVenta) return;
    if (!eItems.every(i => i.descripcion.trim() !== "" && i.cantidad >= 1)) { setEError("Revisa las líneas."); return; }
    setESaving(true); setEError("");
    try {
      const r = await fetch(`/api/admin/ventas/${editVenta.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cliente: eCliente || null, docCliente: eDoc || null, modalidad: eModalidad, fecha: eFecha, notas: eNotas || null, items: eItems }),
      });
      if (r.ok) { setEditVenta(null); load(); }
      else { const d = await r.json().catch(() => ({})); setEError(d.error || "No se pudo guardar."); }
    } catch { setEError("Error de conexión."); }
    setESaving(false);
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
                <button onClick={() => abrirPublicar(v)} title="Publicar al catálogo web"
                  className="text-slate-400 hover:text-[#0f1f3d] shrink-0 p-1"><Tags className="h-4 w-4" /></button>
                <button onClick={() => abrirEditar(v)} title="Editar venta"
                  className="text-slate-400 hover:text-blue-600 shrink-0 p-1"><Pencil className="h-4 w-4" /></button>
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

      {/* Modal: Publicar al catálogo */}
      {pubVenta && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setPubVenta(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md my-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-black text-slate-900 flex items-center gap-2"><Tags className="h-5 w-5 text-[#0f1f3d]" /> Publicar al catálogo</h2>
              <button onClick={() => setPubVenta(null)} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500">El socio lo verá al precio facturado; en la web pública se muestra el precio público (sugerido +15%). Puedes ajustarlo.</p>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Descripción</label>
                <input value={pubForm.descripcion} onChange={e => setPubForm(f => ({ ...f, descripcion: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Código (opcional)</label>
                <input value={pubForm.codigo} onChange={e => setPubForm(f => ({ ...f, codigo: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Precio socio</label>
                  <input type="number" min={0} step="0.01" value={pubForm.precioSocio}
                    onChange={e => setPubForm(f => ({ ...f, precioSocio: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Precio público</label>
                  <input type="number" min={0} step="0.01" value={pubForm.precioPublico}
                    onChange={e => setPubForm(f => ({ ...f, precioPublico: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              {Number(pubForm.precioSocio) > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Sugerir:</span>
                  <button onClick={() => setPubForm(f => ({ ...f, precioPublico: conMargen(Number(f.precioSocio), 15) }))}
                    className="font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1 hover:bg-blue-100">+15%</button>
                  <button onClick={() => setPubForm(f => ({ ...f, precioPublico: conMargen(Number(f.precioSocio), 20) }))}
                    className="font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1 hover:bg-blue-100">+20%</button>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Foto (opcional)</label>
                {pubForm.imagenUrl ? (
                  <div className="flex items-center gap-3">
                    <Image src={pubForm.imagenUrl} alt="" width={64} height={64} className="h-16 w-16 rounded-lg object-cover border border-slate-200" />
                    <button onClick={() => setPubForm(f => ({ ...f, imagenUrl: "" }))} className="text-xs font-semibold text-red-600 hover:underline">Quitar foto</button>
                  </div>
                ) : (
                  <UploadDropzone<OurFileRouter, "productoImagen">
                    endpoint="productoImagen"
                    onClientUploadComplete={(files) => {
                      const url = files?.[0]?.ufsUrl ?? files?.[0]?.url;
                      if (url) setPubForm(f => ({ ...f, imagenUrl: url }));
                    }}
                    onUploadError={(err) => setPubError(err?.message || "No se pudo subir la imagen.")}
                    appearance={{
                      container: "border-2 border-dashed border-slate-200 rounded-xl p-3 cursor-pointer hover:border-[#0f1f3d] transition-colors ut-uploading:opacity-70",
                      uploadIcon: "hidden",
                      label: "text-xs text-slate-500",
                      allowedContent: "text-[11px] text-slate-400",
                      button: "bg-[#0f1f3d] text-white text-xs font-bold px-3 py-1.5 rounded-lg ut-ready:bg-[#0f1f3d] after:bg-blue-400",
                    }}
                    content={{ label: "Arrastra una foto o haz clic", button: ({ isUploading }) => (isUploading ? "Subiendo…" : "Subir foto") }}
                  />
                )}
              </div>
              {pubError && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{pubError}</p>}
              {pubOk ? (
                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 flex items-center gap-2"><Check className="h-4 w-4" /> ¡Publicado en el catálogo!</p>
              ) : (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setPubVenta(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
                  <button onClick={publicar} disabled={pubSaving}
                    className="flex-1 py-2.5 rounded-xl bg-[#0f1f3d] hover:bg-[#16294f] text-white text-sm font-bold disabled:opacity-40">
                    {pubSaving ? "Publicando…" : "Publicar"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar venta */}
      {editVenta && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setEditVenta(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-black text-slate-900 flex items-center gap-2"><Pencil className="h-5 w-5 text-[#0f1f3d]" /> Editar venta · {editVenta.numero}</h2>
              <button onClick={() => setEditVenta(null)} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Cliente</label>
                  <input value={eCliente} onChange={e => setECliente(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">DNI / RUC</label>
                  <input value={eDoc} onChange={e => setEDoc(e.target.value)} inputMode="numeric" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Modalidad</label>
                  <select value={eModalidad} onChange={e => setEModalidad(e.target.value as "CONTADO" | "CREDITO")}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="CONTADO">Contado</option>
                    <option value="CREDITO">Crédito</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Fecha</label>
                  <input type="date" value={eFecha} onChange={e => setEFecha(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Repuestos</label>
                  <button onClick={eAddItem} className="flex items-center gap-1 text-xs text-blue-700 font-semibold hover:underline"><Plus className="h-3.5 w-3.5" /> Agregar línea</button>
                </div>
                <div className="space-y-2">
                  {eItems.map((it, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-end border border-slate-100 rounded-xl p-2">
                      <div className="col-span-12 sm:col-span-5">
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Descripción</label>
                        <input value={it.descripcion} onChange={e => eUpdateItem(i, "descripcion", e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div className="col-span-6 sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Código</label>
                        <input value={it.codigo} onChange={e => eUpdateItem(i, "codigo", e.target.value)} className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm" />
                      </div>
                      <div className="col-span-6 sm:col-span-1">
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Cant.</label>
                        <input type="number" min={1} value={it.cantidad} onChange={e => eUpdateItem(i, "cantidad", parseInt(e.target.value) || 1)} className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm text-center" />
                      </div>
                      <div className="col-span-6 sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Precio (c/IGV)</label>
                        <input type="number" min={0} step="0.01" value={it.precioUnit} onChange={e => eUpdateItem(i, "precioUnit", parseFloat(e.target.value) || 0)} className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm" />
                      </div>
                      <div className="col-span-5 sm:col-span-1">
                        <label className="block text-[10px] font-semibold text-emerald-600 uppercase mb-0.5">Costo</label>
                        <input type="number" min={0} step="0.01" value={it.costoUnit} onChange={e => eUpdateItem(i, "costoUnit", parseFloat(e.target.value) || 0)} className="w-full border border-emerald-200 bg-emerald-50/40 rounded-lg px-2 py-2 text-sm" />
                      </div>
                      <div className="col-span-1 flex justify-center pb-2">
                        {eItems.length > 1 && <button onClick={() => eRemoveItem(i)} className="text-slate-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Notas</label>
                <input value={eNotas} onChange={e => setENotas(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              {eError && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{eError}</p>}
              <div className="flex gap-2 pt-1">
                <button onClick={() => setEditVenta(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
                <button onClick={guardarEdicion} disabled={eSaving}
                  className="flex-1 py-2.5 rounded-xl bg-[#0f1f3d] hover:bg-[#16294f] text-white text-sm font-bold disabled:opacity-40">
                  {eSaving ? "Guardando…" : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
