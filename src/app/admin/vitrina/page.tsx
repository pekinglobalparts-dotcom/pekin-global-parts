"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";
import { Store, AlertTriangle, Trash2, Pencil, Plus, X, Eye, EyeOff, Star, ImageIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Producto {
  id: string;
  codigo: string | null;
  descripcion: string;
  marca: string | null;
  modelo: string | null;
  imagenUrl: string | null;
  precioSocio: number;
  precioPublico: number;
  activo: boolean;
  destacado: boolean;
  orden: number;
  origen: string | null;
}

interface FormState {
  descripcion: string;
  codigo: string;
  marca: string;
  modelo: string;
  imagenUrl: string;
  precioSocio: string;
  precioPublico: string;
  destacado: boolean;
}

const emptyForm: FormState = {
  descripcion: "", codigo: "", marca: "", modelo: "", imagenUrl: "",
  precioSocio: "", precioPublico: "", destacado: false,
};

const conMargen = (socio: string, pct: number) => {
  const n = parseFloat(socio);
  if (!n || n <= 0) return "";
  return (Math.round(n * (1 + pct / 100) * 100) / 100).toFixed(2);
};

export default function VitrinaPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/vitrina");
    if (r.status === 401) { setDenied(true); setLoading(false); return; }
    const d = await r.json();
    setProductos((d.productos || []).map((p: Producto) => ({
      ...p, precioSocio: Number(p.precioSocio), precioPublico: Number(p.precioPublico),
    })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const abrirNuevo = () => {
    setForm(emptyForm); setEditId(null); setError(""); setShowForm(true);
  };

  const abrirEdicion = (p: Producto) => {
    setForm({
      descripcion: p.descripcion,
      codigo: p.codigo || "",
      marca: p.marca || "",
      modelo: p.modelo || "",
      imagenUrl: p.imagenUrl || "",
      precioSocio: String(p.precioSocio),
      precioPublico: String(p.precioPublico),
      destacado: p.destacado,
    });
    setEditId(p.id); setError(""); setShowForm(true);
  };

  const cerrar = () => { setShowForm(false); setEditId(null); setForm(emptyForm); setError(""); };

  const guardar = async () => {
    if (!form.descripcion.trim() || !form.precioSocio || !form.precioPublico) {
      setError("Completa la descripción y ambos precios.");
      return;
    }
    setSaving(true); setError("");
    const payload = {
      descripcion: form.descripcion.trim(),
      codigo: form.codigo.trim() || null,
      marca: form.marca.trim() || null,
      modelo: form.modelo.trim() || null,
      imagenUrl: form.imagenUrl || null,
      precioSocio: parseFloat(form.precioSocio),
      precioPublico: parseFloat(form.precioPublico),
      destacado: form.destacado,
    };
    try {
      const r = editId
        ? await fetch(`/api/admin/vitrina/${editId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/admin/vitrina", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (r.ok) { cerrar(); load(); }
      else { const d = await r.json().catch(() => ({})); setError(d.error || "No se pudo guardar."); }
    } catch { setError("Error de conexión."); }
    setSaving(false);
  };

  const toggle = async (p: Producto, campo: "activo" | "destacado") => {
    setProductos(prev => prev.map(x => x.id === p.id ? { ...x, [campo]: !x[campo] } : x));
    await fetch(`/api/admin/vitrina/${p.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [campo]: !p[campo] }),
    });
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Quitar este producto del catálogo?")) return;
    await fetch(`/api/admin/vitrina/${id}`, { method: "DELETE" });
    setProductos(prev => prev.filter(p => p.id !== id));
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
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Store className="h-6 w-6 text-[#0f1f3d]" /> Catálogo / Vitrina</h1>
          <p className="text-slate-500 text-sm mt-0.5 max-w-2xl">
            Productos con foto y precio que se muestran en la web pública (precio <b>público</b>) y a los socios (precio de <b>socio</b>, lo que se factura).
            Se agregan poco a poco y se pueden actualizar cuando cambie el precio del proveedor.
          </p>
        </div>
        <button onClick={abrirNuevo}
          className="flex items-center gap-2 bg-[#0f1f3d] hover:bg-[#16294f] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0">
          <Plus className="h-4 w-4" /> Agregar producto
        </button>
      </div>

      {/* Formulario (modal) */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto" onClick={cerrar}>
          <div className="bg-white rounded-2xl w-full max-w-lg my-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-black text-slate-900">{editId ? "Editar producto" : "Nuevo producto"}</h2>
              <button onClick={cerrar} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Descripción *</label>
                <input value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Ej: Pastillas de freno delanteras Hilux 2016-2023"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Código</label>
                  <input value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))}
                    placeholder="Opc." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Marca</label>
                  <input value={form.marca} onChange={e => setForm(f => ({ ...f, marca: e.target.value }))}
                    placeholder="Opc." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Modelo</label>
                  <input value={form.modelo} onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))}
                    placeholder="Opc." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>

              {/* Imagen */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Foto (opcional)</label>
                {form.imagenUrl ? (
                  <div className="flex items-center gap-3">
                    <Image src={form.imagenUrl} alt="" width={72} height={72} className="h-[72px] w-[72px] rounded-lg object-cover border border-slate-200" />
                    <button onClick={() => setForm(f => ({ ...f, imagenUrl: "" }))}
                      className="text-xs font-semibold text-red-600 hover:underline">Quitar foto</button>
                  </div>
                ) : (
                  <UploadDropzone<OurFileRouter, "productoImagen">
                    endpoint="productoImagen"
                    onClientUploadComplete={(files) => {
                      const url = files?.[0]?.ufsUrl ?? files?.[0]?.url;
                      if (url) setForm(f => ({ ...f, imagenUrl: url }));
                    }}
                    onUploadError={(err) => setError(err?.message || "No se pudo subir la imagen.")}
                    appearance={{
                      container: "border-2 border-dashed border-slate-200 rounded-xl p-3 cursor-pointer hover:border-[#0f1f3d] transition-colors ut-uploading:opacity-70",
                      uploadIcon: "hidden",
                      label: "text-xs text-slate-500",
                      allowedContent: "text-[11px] text-slate-400",
                      button: "bg-[#0f1f3d] text-white text-xs font-bold px-3 py-1.5 rounded-lg ut-ready:bg-[#0f1f3d] after:bg-blue-400",
                    }}
                    content={{
                      label: "Arrastra una foto o haz clic",
                      button: ({ isUploading }) => (isUploading ? "Subiendo…" : "Subir foto"),
                    }}
                  />
                )}
              </div>

              {/* Precios */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Precio socio / mayorista *</label>
                  <input type="number" min={0} step="0.01" value={form.precioSocio}
                    onChange={e => setForm(f => ({ ...f, precioSocio: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Precio público (unitario) *</label>
                  <input type="number" min={0} step="0.01" value={form.precioPublico}
                    onChange={e => setForm(f => ({ ...f, precioPublico: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              {form.precioSocio && parseFloat(form.precioSocio) > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Sugerir público:</span>
                  <button onClick={() => setForm(f => ({ ...f, precioPublico: conMargen(f.precioSocio, 15) }))}
                    className="font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1 hover:bg-blue-100">
                    +15% → {formatCurrency(Number(conMargen(form.precioSocio, 15)) || 0)}
                  </button>
                  <button onClick={() => setForm(f => ({ ...f, precioPublico: conMargen(f.precioSocio, 20) }))}
                    className="font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1 hover:bg-blue-100">
                    +20% → {formatCurrency(Number(conMargen(form.precioSocio, 20)) || 0)}
                  </button>
                </div>
              )}

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={form.destacado} onChange={e => setForm(f => ({ ...f, destacado: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300" />
                Destacar (aparece primero)
              </label>

              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button onClick={cerrar} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
                <button onClick={guardar} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#0f1f3d] hover:bg-[#16294f] text-white text-sm font-bold disabled:opacity-40">
                  {saving ? "Guardando…" : editId ? "Guardar cambios" : "Agregar al catálogo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Listado */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-sm">Cargando…</div>
      ) : productos.length === 0 ? (
        <div className="p-10 text-center bg-white border border-slate-200 rounded-2xl">
          <Store className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold mb-1">El catálogo está vacío</p>
          <p className="text-slate-400 text-sm">Agrega productos con el botón de arriba, o publícalos desde una venta de mostrador.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {productos.map(p => (
            <div key={p.id} className={`bg-white border rounded-2xl overflow-hidden flex flex-col ${p.activo ? "border-slate-200" : "border-slate-200 opacity-60"}`}>
              <div className="relative aspect-square bg-slate-100 flex items-center justify-center">
                {p.imagenUrl ? (
                  <Image src={p.imagenUrl} alt={p.descripcion} fill className="object-cover" sizes="(max-width:640px) 100vw, 33vw" />
                ) : (
                  <ImageIcon className="h-10 w-10 text-slate-300" />
                )}
                {p.destacado && (
                  <span className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3" /> Destacado
                  </span>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <p className="text-sm font-bold text-slate-900 leading-tight line-clamp-2">{p.descripcion}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {[p.marca, p.modelo].filter(Boolean).join(" · ")}{p.codigo ? ` · ${p.codigo}` : ""}
                </p>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <p className="text-[11px] text-slate-400">Público (unit.)</p>
                    <p className="text-base font-black text-slate-900">{formatCurrency(p.precioPublico)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-emerald-500">Socio / may.</p>
                    <p className="text-sm font-bold text-emerald-700">{formatCurrency(p.precioSocio)}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-1">
                  <button onClick={() => toggle(p, "activo")} title={p.activo ? "Ocultar de la web" : "Mostrar en la web"}
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-lg ${p.activo ? "text-emerald-700 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-50"}`}>
                    {p.activo ? <><Eye className="h-3.5 w-3.5" /> Visible</> : <><EyeOff className="h-3.5 w-3.5" /> Oculto</>}
                  </button>
                  <div className="flex-1" />
                  <button onClick={() => abrirEdicion(p)} className="text-slate-400 hover:text-blue-600 p-1.5" title="Editar"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => eliminar(p.id)} className="text-slate-300 hover:text-red-500 p-1.5" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
