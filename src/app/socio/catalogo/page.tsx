"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, X, MessageCircle, ShoppingCart, Package,
  ChevronDown, Star, AlertCircle, Check,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  destacado: boolean;
  modelosCompatibles: string[];
  categoria: { nombre: string; slug: string };
  marca: { nombre: string };
}

interface Categoria { id: string; nombre: string; slug: string }
interface Marca { id: string; nombre: string }

function ProductCard({
  producto,
  onCotizar,
  onVerDetalle,
}: {
  producto: Producto;
  onCotizar: (p: Producto) => void;
  onVerDetalle: (p: Producto) => void;
}) {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51953096242";
  const msg = encodeURIComponent(
    `Hola, me interesa solicitar cotización:\n• Producto: ${producto.nombre}\n• Código: ${producto.codigo}\n• Cantidad: 1`
  );
  const inStock = producto.stock > 0;
  const lowStock = producto.stock > 0 && producto.stock <= producto.stockMinimo;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden group hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer"
    >
      {/* Image area */}
      <div
        onClick={() => onVerDetalle(producto)}
        className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden"
      >
        {producto.imagenUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={producto.imagenUrl}
            alt={producto.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-slate-200" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {producto.destacado && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm"
            >
              <Star className="h-2.5 w-2.5 fill-current" />
              Destacado
            </motion.div>
          )}
          <div
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              !inStock
                ? "bg-red-100 text-red-700"
                : lowStock
                ? "bg-amber-100 text-amber-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {!inStock ? "Sin stock" : lowStock ? `Últimas ${producto.stock}` : "En stock"}
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/5 transition-colors" />
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-mono text-slate-400">{producto.codigo}</span>
          <span className="text-xs text-slate-400">{producto.marca.nombre}</span>
        </div>

        <h3
          onClick={() => onVerDetalle(producto)}
          className="font-bold text-slate-900 text-sm leading-snug mb-1 line-clamp-2 hover:text-blue-900 transition-colors"
        >
          {producto.nombre}
        </h3>

        <p className="text-xs text-slate-400 mb-1">{producto.categoria.nombre}</p>

        {producto.modelosCompatibles.length > 0 && (
          <p className="text-xs text-slate-400 mb-3 line-clamp-1">
            {producto.modelosCompatibles.slice(0, 3).join(" · ")}
            {producto.modelosCompatibles.length > 3 && ` +${producto.modelosCompatibles.length - 3}`}
          </p>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <p className="text-xl font-black text-blue-900">{formatCurrency(producto.precio)}</p>
            <p className="text-xs text-slate-400">por {producto.unidad}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onCotizar(producto)}
              className="bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Cotizar
            </button>
            <a
              href={`https://wa.me/${whatsapp}?text=${msg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
              title="WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProductDetailModal({
  producto,
  onClose,
  onCotizar,
}: {
  producto: Producto;
  onClose: () => void;
  onCotizar: (p: Producto) => void;
}) {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51953096242";
  const msg = encodeURIComponent(
    `Hola, me interesa:\n• ${producto.nombre}\n• Código: ${producto.codigo}`
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl"
      >
        <div className="relative aspect-video bg-slate-100">
          {producto.imagenUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-20 w-20 text-slate-200" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full hover:bg-white transition-colors shadow"
          >
            <X className="h-4 w-4 text-slate-700" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{producto.codigo}</span>
            <Badge variant="secondary">{producto.categoria.nombre}</Badge>
            {producto.destacado && <Badge variant="warning">Destacado</Badge>}
          </div>

          <h2 className="text-xl font-black text-slate-900 mb-2">{producto.nombre}</h2>
          <p className="text-slate-500 text-sm mb-1">Marca: <strong>{producto.marca.nombre}</strong></p>

          {producto.descripcion && (
            <p className="text-slate-600 text-sm mt-3 mb-4 leading-relaxed">{producto.descripcion}</p>
          )}

          {producto.modelosCompatibles.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Modelos compatibles</p>
              <div className="flex flex-wrap gap-1.5">
                {producto.modelosCompatibles.map(m => (
                  <span key={m} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mt-2 mb-5">
            <div
              className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg ${
                producto.stock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {producto.stock > 0 ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {producto.stock > 0 ? `${producto.stock} ${producto.unidad} disponibles` : "Sin stock"}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-blue-900">{formatCurrency(producto.precio)}</p>
              <p className="text-xs text-slate-400">Precio por {producto.unidad}</p>
            </div>
            <div className="flex gap-3">
              <a
                href={`https://wa.me/${whatsapp}?text=${msg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <Button onClick={() => { onClose(); onCotizar(producto); }}>
                <ShoppingCart className="h-4 w-4" />
                Solicitar cotización
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CotizacionModal({
  producto,
  onClose,
}: {
  producto: Producto;
  onClose: () => void;
}) {
  const [cantidad, setCantidad] = useState(1);
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await fetch("/api/socio/cotizaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ productoId: producto.id, cantidad, notas }],
        notas,
      }),
    });
    setSuccess(true);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6"
      >
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">¡Cotización enviada!</h3>
            <p className="text-slate-500 text-sm mb-6">
              Recibirá la respuesta en su panel y por correo electrónico.
            </p>
            <Button onClick={onClose}>Cerrar</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">Solicitar cotización</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-5">
              <p className="font-semibold text-slate-900 text-sm">{producto.nombre}</p>
              <p className="text-xs text-slate-400 mt-0.5">{producto.codigo} · {formatCurrency(producto.precio)} / {producto.unidad}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={e => setCantidad(parseInt(e.target.value) || 1)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Notas adicionales</label>
                <textarea
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  placeholder="Especificaciones adicionales, urgencia, etc."
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="ghost" className="flex-1" onClick={onClose}>Cancelar</Button>
              <Button className="flex-1" loading={loading} onClick={handleSubmit}>
                Enviar cotización
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function SocioCatalogoPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [marcaFiltro, setMarcaFiltro] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [detalle, setDetalle] = useState<Producto | null>(null);
  const [cotizarProducto, setCotizarProducto] = useState<Producto | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout>(null);

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "12",
      ...(search && { search }),
      ...(categoriaFiltro && { categoriaId: categoriaFiltro }),
      ...(marcaFiltro && { marcaId: marcaFiltro }),
    });
    const res = await fetch(`/api/productos?${params}`);
    const data = await res.json();
    setProductos(data.productos || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, search, categoriaFiltro, marcaFiltro]);

  useEffect(() => {
    fetch("/api/categorias").then(r => r.json()).then(setCategorias).catch(() => {});
    fetch("/api/marcas").then(r => r.json()).then(setMarcas).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(fetchProductos, 300);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [fetchProductos]);

  const clearFiltros = () => {
    setSearch(""); setCategoriaFiltro(""); setMarcaFiltro(""); setPage(1);
  };

  const tienesFiltros = search || categoriaFiltro || marcaFiltro;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Catálogo de productos</h1>
        <p className="text-slate-500 text-sm mt-0.5">{total} productos disponibles</p>
      </div>

      {/* Search + filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, código, modelo..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <select
              value={categoriaFiltro}
              onChange={e => { setCategoriaFiltro(e.target.value); setPage(1); }}
              className="appearance-none w-full sm:w-44 border border-slate-200 rounded-xl px-4 py-2.5 text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Brand filter */}
          <div className="relative">
            <select
              value={marcaFiltro}
              onChange={e => { setMarcaFiltro(e.target.value); setPage(1); }}
              className="appearance-none w-full sm:w-36 border border-slate-200 rounded-xl px-4 py-2.5 text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="">Todas las marcas</option>
              {marcas.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {tienesFiltros && (
            <button
              onClick={clearFiltros}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 whitespace-nowrap"
            >
              <X className="h-4 w-4" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="aspect-square bg-slate-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-slate-100 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : productos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 text-slate-400"
        >
          <Package className="h-16 w-16 mx-auto mb-4 text-slate-200" />
          <p className="font-semibold text-slate-600 text-lg">No se encontraron productos</p>
          <p className="text-sm mt-1">Intente con otros filtros de búsqueda</p>
          {tienesFiltros && (
            <button onClick={clearFiltros} className="mt-4 text-blue-900 font-medium hover:underline">
              Limpiar filtros
            </button>
          )}
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${search}-${categoriaFiltro}-${marcaFiltro}-${page}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {productos.map((producto) => (
              <ProductCard
                key={producto.id}
                producto={producto}
                onCotizar={setCotizarProducto}
                onVerDetalle={setDetalle}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:border-slate-300 transition-colors"
          >
            Anterior
          </button>
          <span className="text-sm text-slate-500">
            Página {page} de {Math.ceil(total / 12)}
          </span>
          <button
            disabled={page >= Math.ceil(total / 12)}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:border-slate-300 transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {detalle && (
          <ProductDetailModal
            producto={detalle}
            onClose={() => setDetalle(null)}
            onCotizar={p => { setDetalle(null); setCotizarProducto(p); }}
          />
        )}
        {cotizarProducto && (
          <CotizacionModal
            producto={cotizarProducto}
            onClose={() => setCotizarProducto(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
