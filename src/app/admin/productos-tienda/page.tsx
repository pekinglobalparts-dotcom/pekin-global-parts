"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, Search, Plus, Pencil, Trash2, X, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Producto {
  id: string;
  codigo: string;
  descripcion: string;
  precio: number;
  costo?: number | null;
  stock: number;
  stockMinimo: number;
  activo: boolean;
}

type Form = {
  id?: string;
  codigo: string;
  descripcion: string;
  precio: string;
  costo: string;
  stock: string;
  stockMinimo: string;
};

const vacio = (): Form => ({ codigo: "", descripcion: "", precio: "", costo: "", stock: "0", stockMinimo: "0" });

export default function ProductosTiendaPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [esSuperAdmin, setEsSuperAdmin] = useState(false);

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Form>(vacio());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (q: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/productos-tienda${q ? `?search=${encodeURIComponent(q)}` : ""}`);
    const data = await res.json();
    setProductos(data.productos || []);
    setEsSuperAdmin(!!data.esSuperAdmin);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), 250);
    return () => clearTimeout(t);
  }, [search, load]);

  const abrirNuevo = () => { setForm(vacio()); setError(""); setModal(true); };
  const abrirEditar = (p: Producto) => {
    setForm({
      id: p.id, codigo: p.codigo, descripcion: p.descripcion,
      precio: String(Number(p.precio)), costo: p.costo != null ? String(Number(p.costo)) : "",
      stock: String(p.stock), stockMinimo: String(p.stockMinimo),
    });
    setError(""); setModal(true);
  };

  const guardar = async () => {
    if (!form.codigo.trim() || !form.descripcion.trim() || !form.precio) {
      setError("Código, descripción y precio son obligatorios."); return;
    }
    setSaving(true); setError("");
    const body = {
      codigo: form.codigo.trim(), descripcion: form.descripcion.trim(),
      precio: parseFloat(form.precio) || 0,
      costo: form.costo ? parseFloat(form.costo) : null,
      stock: parseInt(form.stock) || 0, stockMinimo: parseInt(form.stockMinimo) || 0,
    };
    const url = form.id ? `/api/admin/productos-tienda/${form.id}` : "/api/admin/productos-tienda";
    const res = await fetch(url, { method: form.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setModal(false); load(search); }
    else { const d = await res.json().catch(() => ({})); setError(d.error || "No se pudo guardar."); }
    setSaving(false);
  };

  const eliminar = async (p: Producto) => {
    if (!confirm(`¿Eliminar "${p.descripcion}"?`)) return;
    await fetch(`/api/admin/productos-tienda/${p.id}`, { method: "DELETE" });
    setProductos(prev => prev.filter(x => x.id !== p.id));
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Package className="h-6 w-6 text-[#0f1f3d]" /> Productos / Inventario</h1>
          <p className="text-slate-500 text-sm mt-0.5">Tu catálogo de tienda. Busca por código o nombre; los precios se manejan con IGV.</p>
        </div>
        {esSuperAdmin && (
          <button onClick={abrirNuevo} className="flex items-center gap-2 bg-[#0f1f3d] hover:bg-[#16294f] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0">
            <Plus className="h-4 w-4" /> Agregar producto
          </button>
        )}
      </div>

      {/* Buscador */}
      <div className="relative max-w-md">
        <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por código o descripción…"
          className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm" />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Cargando…</div>
        ) : productos.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Package className="h-10 w-10 mx-auto mb-3 text-slate-200" />
            <p className="text-sm">{search ? "No se encontraron productos." : "Aún no tienes productos. Empieza agregando uno."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-left text-[11px] text-slate-500 uppercase">
                  <th className="px-4 py-3 font-semibold">Código</th>
                  <th className="px-4 py-3 font-semibold">Descripción</th>
                  <th className="px-4 py-3 font-semibold text-right">Precio</th>
                  <th className="px-4 py-3 font-semibold text-center">Stock</th>
                  {esSuperAdmin && <th className="px-4 py-3 font-semibold text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {productos.map(p => {
                  const bajo = p.stock <= p.stockMinimo;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-semibold text-slate-800">{p.codigo}</td>
                      <td className="px-4 py-3 text-slate-700">{p.descripcion}</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-900">{formatCurrency(p.precio)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${bajo ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {bajo && <AlertTriangle className="h-3 w-3" />}{p.stock}
                        </span>
                      </td>
                      {esSuperAdmin && (
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button onClick={() => abrirEditar(p)} className="text-slate-400 hover:text-blue-600 p-1"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => eliminar(p)} className="text-slate-400 hover:text-red-500 p-1 ml-1"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-[11px] text-slate-400">Consejo: no necesitas cargar todo de golpe. Ve agregando los productos que más vendes; cuando tengas tu base en Excel, la importamos.</p>

      {/* Modal alta/edición */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-slate-900 text-lg">{form.id ? "Editar producto" : "Agregar producto"}</h3>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código</label>
                  <input value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} placeholder="Ej: 04949-0K070" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Precio (con IGV)</label>
                  <input type="number" min={0} step="0.01" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} placeholder="0.00" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción</label>
                <input value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Ej: Pastillas de freno Hilux FRITEC" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-emerald-600 uppercase mb-1">Costo (opcional)</label>
                  <input type="number" min={0} step="0.01" value={form.costo} onChange={e => setForm(f => ({ ...f, costo: e.target.value }))} placeholder="—" className="w-full border border-emerald-200 bg-emerald-50/40 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Stock</label>
                  <input type="number" min={0} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Stock mín.</label>
                  <input type="number" min={0} value={form.stockMinimo} onChange={e => setForm(f => ({ ...f, stockMinimo: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
              <button onClick={guardar} disabled={saving} className="w-full py-2.5 rounded-xl bg-[#0f1f3d] hover:bg-[#16294f] text-white text-sm font-bold disabled:opacity-40 transition-colors">
                {saving ? "Guardando…" : (form.id ? "Guardar cambios" : "Agregar producto")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
