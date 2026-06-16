"use client";

import { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, GripVertical, Edit2, Trash2, Eye, EyeOff,
  Star, StarOff, X, Check, Package, Upload, ChevronDown,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Categoria { id: string; nombre: string; slug: string }
interface Marca { id: string; nombre: string }
interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  imagenUrl: string | null;
  precio: number;
  stock: number;
  stockMinimo: number;
  unidad: string;
  activo: boolean;
  destacado: boolean;
  orden: number;
  categoriaId: string;
  marcaId: string;
  modelosCompatibles: string[];
  categoria: { nombre: string };
  marca: { nombre: string };
}

const emptyForm = {
  codigo: "", nombre: "", descripcion: "", imagenUrl: "",
  categoriaId: "", marcaId: "", precio: "", stock: "0",
  stockMinimo: "5", unidad: "und", activo: true, destacado: false,
  modelosCompatibles: "",
};

export default function AdminProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [inlineEdit, setInlineEdit] = useState<{ id: string; field: string; value: string } | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [prodRes, catRes, marcaRes] = await Promise.all([
      fetch("/api/admin/productos?limit=100"),
      fetch("/api/categorias"),
      fetch("/api/marcas"),
    ]);
    const [prodData, catData, marcaData] = await Promise.all([
      prodRes.json(), catRes.json(), marcaRes.json(),
    ]);
    setProductos((prodData.productos || []).sort((a: Producto, b: Producto) => a.orden - b.orden));
    setCategorias(catData || []);
    setMarcas(marcaData || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo.toLowerCase().includes(search.toLowerCase()) ||
    p.marca.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(filtered);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    const reordered = items.map((p, i) => ({ ...p, orden: i }));
    setProductos(prev => {
      const map = new Map(reordered.map(p => [p.id, p]));
      return prev.map(p => map.get(p.id) || p);
    });
    await fetch("/api/admin/productos/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: reordered.map(p => ({ id: p.id, orden: p.orden })) }),
    });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImagePreview("");
    setShowModal(true);
  };

  const openEdit = (p: Producto) => {
    setEditingId(p.id);
    setForm({
      codigo: p.codigo, nombre: p.nombre,
      descripcion: p.descripcion || "", imagenUrl: p.imagenUrl || "",
      categoriaId: p.categoriaId, marcaId: p.marcaId,
      precio: String(p.precio), stock: String(p.stock),
      stockMinimo: String(p.stockMinimo), unidad: p.unidad,
      activo: p.activo, destacado: p.destacado,
      modelosCompatibles: p.modelosCompatibles.join(", "),
    });
    setImagePreview(p.imagenUrl || "");
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const body = {
      ...form,
      precio: parseFloat(form.precio),
      stock: parseInt(form.stock),
      stockMinimo: parseInt(form.stockMinimo),
      modelosCompatibles: form.modelosCompatibles
        ? form.modelosCompatibles.split(",").map(s => s.trim()).filter(Boolean)
        : [],
      imagenUrl: form.imagenUrl || null,
    };
    const url = editingId ? `/api/admin/productos/${editingId}` : "/api/admin/productos";
    const method = editingId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowModal(false);
      fetchAll();
    }
    setSaving(false);
  };

  const handleInlineSave = async (id: string, field: string, value: string) => {
    const numFields = ["precio", "stock", "stockMinimo"];
    const parsedValue = numFields.includes(field) ? parseFloat(value) : value;
    await fetch(`/api/admin/productos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: parsedValue }),
    });
    setProductos(prev =>
      prev.map(p => p.id === id ? { ...p, [field]: parsedValue } : p)
    );
    setInlineEdit(null);
  };

  const toggleActivo = async (p: Producto) => {
    await fetch(`/api/admin/productos/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !p.activo }),
    });
    setProductos(prev => prev.map(x => x.id === p.id ? { ...x, activo: !x.activo } : x));
  };

  const toggleDestacado = async (p: Producto) => {
    await fetch(`/api/admin/productos/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destacado: !p.destacado }),
    });
    setProductos(prev => prev.map(x => x.id === p.id ? { ...x, destacado: !x.destacado } : x));
  };

  const handleImageUrl = (url: string) => {
    setForm(f => ({ ...f, imagenUrl: url }));
    setImagePreview(url);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Catálogo de productos</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {productos.length} productos · Arrastra para reordenar
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Nuevo producto
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, código o marca..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
        />
      </div>

      {/* Drag & Drop list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="productos">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                <AnimatePresence initial={false}>
                  {filtered.map((producto, index) => (
                    <Draggable key={producto.id} draggableId={producto.id} index={index}>
                      {(provided, snapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className={`bg-white border rounded-xl overflow-hidden transition-all ${
                            snapshot.isDragging
                              ? "border-blue-400 shadow-xl ring-2 ring-blue-200 rotate-1"
                              : !producto.activo
                              ? "border-slate-200 opacity-60"
                              : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-center gap-4 p-4">
                            {/* Drag handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing p-1"
                            >
                              <GripVertical className="h-5 w-5" />
                            </div>

                            {/* Image */}
                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                              {producto.imagenUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={producto.imagenUrl}
                                  alt={producto.nombre}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-5 w-5 text-slate-300" />
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-mono text-slate-400">{producto.codigo}</span>
                                {producto.destacado && (
                                  <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">
                                    Destacado
                                  </span>
                                )}
                              </div>
                              <p className="font-semibold text-slate-900 text-sm truncate">{producto.nombre}</p>
                              <p className="text-xs text-slate-400">
                                {producto.marca.nombre !== "Sin marca" ? `${producto.marca.nombre} · ` : ""}{producto.categoria.nombre}
                              </p>
                            </div>

                            {/* Inline editable price */}
                            <div className="w-32 shrink-0">
                              {inlineEdit?.id === producto.id && inlineEdit.field === "precio" ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    autoFocus
                                    type="number"
                                    value={inlineEdit.value}
                                    onChange={e => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                                    className="w-20 text-sm border border-blue-400 rounded px-2 py-1 focus:outline-none"
                                    onKeyDown={e => {
                                      if (e.key === "Enter") handleInlineSave(producto.id, "precio", inlineEdit.value);
                                      if (e.key === "Escape") setInlineEdit(null);
                                    }}
                                  />
                                  <button onClick={() => handleInlineSave(producto.id, "precio", inlineEdit.value)}>
                                    <Check className="h-3.5 w-3.5 text-green-600" />
                                  </button>
                                  <button onClick={() => setInlineEdit(null)}>
                                    <X className="h-3.5 w-3.5 text-red-500" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setInlineEdit({ id: producto.id, field: "precio", value: String(producto.precio) })}
                                  className="flex items-center gap-1 text-blue-900 font-bold text-sm hover:text-blue-700 group"
                                  title="Clic para editar precio"
                                >
                                  {formatCurrency(producto.precio)}
                                  <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              )}
                            </div>

                            {/* Stock */}
                            <div className="w-20 shrink-0">
                              {inlineEdit?.id === producto.id && inlineEdit.field === "stock" ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    autoFocus
                                    type="number"
                                    value={inlineEdit.value}
                                    onChange={e => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                                    className="w-14 text-sm border border-blue-400 rounded px-2 py-1 focus:outline-none"
                                    onKeyDown={e => {
                                      if (e.key === "Enter") handleInlineSave(producto.id, "stock", inlineEdit.value);
                                      if (e.key === "Escape") setInlineEdit(null);
                                    }}
                                  />
                                  <button onClick={() => handleInlineSave(producto.id, "stock", inlineEdit.value)}>
                                    <Check className="h-3.5 w-3.5 text-green-600" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setInlineEdit({ id: producto.id, field: "stock", value: String(producto.stock) })}
                                  className="group flex items-center gap-1"
                                  title="Clic para editar stock"
                                >
                                  <span className={`text-sm font-medium ${producto.stock <= producto.stockMinimo ? "text-red-600" : "text-green-600"}`}>
                                    {producto.stock} {producto.unidad}
                                  </span>
                                  <Edit2 className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => toggleDestacado(producto)}
                                className={`p-2 rounded-lg transition-colors ${
                                  producto.destacado ? "text-amber-500 bg-amber-50" : "text-slate-300 hover:text-amber-400 hover:bg-amber-50"
                                }`}
                                title="Destacar"
                              >
                                {producto.destacado ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => toggleActivo(producto)}
                                className={`p-2 rounded-lg transition-colors ${
                                  producto.activo ? "text-green-600 bg-green-50" : "text-slate-300 hover:text-green-500 hover:bg-green-50"
                                }`}
                                title={producto.activo ? "Desactivar" : "Activar"}
                              >
                                {producto.activo ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => openEdit(producto)}
                                className="p-2 rounded-lg text-slate-400 hover:text-blue-900 hover:bg-blue-50 transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                </AnimatePresence>
                {provided.placeholder}

                {filtered.length === 0 && (
                  <div className="text-center py-16 text-slate-400">
                    <Package className="h-12 w-12 mx-auto mb-3 text-slate-200" />
                    <p>No se encontraron productos</p>
                    <Button className="mt-4" onClick={openCreate}>Crear el primero</Button>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Modal crear/editar */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Modal header */}
              <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId ? "Editar producto" : "Nuevo producto"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Image upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Imagen del producto
                  </label>
                  <div className="flex gap-4 items-start">
                    {/* Preview */}
                    <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden shrink-0 flex items-center justify-center bg-slate-50">
                      {imagePreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={() => setImagePreview("")}
                        />
                      ) : (
                        <Package className="h-8 w-8 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="url"
                        placeholder="URL de la imagen (https://...)"
                        value={form.imagenUrl}
                        onChange={e => handleImageUrl(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                      />
                      <p className="text-xs text-slate-400">
                        Pega la URL de la imagen. Formatos: JPG, PNG, WebP. Recomendado: 400×400px
                      </p>
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={() => { setImagePreview(""); setForm(f => ({ ...f, imagenUrl: "" })); }}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Quitar imagen
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Basic info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Código *</label>
                    <input
                      value={form.codigo}
                      onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))}
                      placeholder="PKN-FR-001"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Unidad</label>
                    <select
                      value={form.unidad}
                      onChange={e => setForm(f => ({ ...f, unidad: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      {["und", "par", "kit", "set", "litro", "ml"].map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre del producto *</label>
                  <input
                    value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    placeholder="Pastillas de freno delanteras Toyota Hilux"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Descripción
                  </label>
                  <textarea
                    value={form.descripcion}
                    onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                    placeholder="Descripción detallada del producto, especificaciones técnicas..."
                    rows={3}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoría *</label>
                    <select
                      value={form.categoriaId}
                      onChange={e => setForm(f => ({ ...f, categoriaId: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="">Seleccionar...</option>
                      {categorias.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Marca *</label>
                    <select
                      value={form.marcaId}
                      onChange={e => setForm(f => ({ ...f, marcaId: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="">Seleccionar...</option>
                      {marcas.map(m => (
                        <option key={m.id} value={m.id}>{m.nombre === "Sin marca" ? "Sin marca específica" : m.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Precio (S/) *</label>
                    <input
                      type="number"
                      value={form.precio}
                      onChange={e => setForm(f => ({ ...f, precio: e.target.value }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Stock</label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                      min="0"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Stock mínimo</label>
                    <input
                      type="number"
                      value={form.stockMinimo}
                      onChange={e => setForm(f => ({ ...f, stockMinimo: e.target.value }))}
                      min="0"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Modelos compatibles
                  </label>
                  <input
                    value={form.modelosCompatibles}
                    onChange={e => setForm(f => ({ ...f, modelosCompatibles: e.target.value }))}
                    placeholder="Hilux 2018, Hilux 2019, Hilux 2020 (separar con comas)"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.activo}
                      onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-blue-900"
                    />
                    <span className="text-sm font-medium text-slate-700">Producto activo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.destacado}
                      onChange={e => setForm(f => ({ ...f, destacado: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-amber-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Producto destacado</span>
                  </label>
                </div>
              </div>

              {/* Modal footer */}
              <div className="sticky bottom-0 bg-white border-t border-slate-100 p-6 flex justify-end gap-3 rounded-b-2xl">
                <Button variant="ghost" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button
                  loading={saving}
                  onClick={handleSave}
                  disabled={!form.nombre || !form.codigo || !form.precio || !form.categoriaId || !form.marcaId}
                >
                  {editingId ? "Guardar cambios" : "Crear producto"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
