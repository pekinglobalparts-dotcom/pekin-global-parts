"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, MessageCircle, ShoppingCart, Package,
  ChevronDown, Star, AlertCircle, Check, Plus, Minus, Trash2, Send, Car,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51953096242";

// ── Types ──────────────────────────────────────────────────────────────────────
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

interface CartItem {
  producto: Producto;
  cantidad: number;
}

interface Categoria { id: string; nombre: string; slug: string }
interface Marca { id: string; nombre: string }

interface RepuestoItem {
  modelo: string;
  anio: string;
  repuesto: string;
}

interface CartRepuestoGroup {
  brand: string;
  items: RepuestoItem[];
}

// ── Brand data ─────────────────────────────────────────────────────────────────
const VEHICLE_BRANDS = [
  { name: "Toyota",      color: "#CC0000",  emoji: "🚗" },
  { name: "Nissan",      color: "#C3002F",  emoji: "🚙" },
  { name: "Mitsubishi",  color: "#E60026",  emoji: "🚗" },
  { name: "Hyundai",     color: "#002C5F",  emoji: "🚙" },
  { name: "Kia",         color: "#05141F",  emoji: "🚗" },
  { name: "Volkswagen",  color: "#001E50",  emoji: "🚙" },
  { name: "Chevrolet",   color: "#D4AF37",  emoji: "🚗" },
  { name: "Ford",        color: "#003DA5",  emoji: "🚙" },
  { name: "BYD",         color: "#1DB954",  emoji: "⚡" },
  { name: "Chery",       color: "#CC0000",  emoji: "🚗" },
  { name: "JAC",         color: "#003087",  emoji: "🚙" },
  { name: "Jetour",      color: "#1a1a2e",  emoji: "🚗" },
  { name: "Land Rover",  color: "#005A2B",  emoji: "🛻" },
  { name: "Jeep",        color: "#1B1B1B",  emoji: "🛻" },
  { name: "Honda",       color: "#CC0000",  emoji: "🚗" },
  { name: "Mazda",       color: "#910000",  emoji: "🚙" },
  { name: "Suzuki",      color: "#003087",  emoji: "🚗" },
];

// ── Brand Request Modal ────────────────────────────────────────────────────────
function BrandRequestModal({
  brandName,
  onClose,
  onAddToCart,
}: {
  brandName: string;
  onClose: () => void;
  onAddToCart: (items: RepuestoItem[], brand: string) => void;
}) {
  const [items, setItems] = useState<RepuestoItem[]>([
    { modelo: "", anio: "", repuesto: "" },
  ]);

  const updateItem = (index: number, field: keyof RepuestoItem, value: string) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addItem = () => setItems(prev => [...prev, { modelo: "", anio: "", repuesto: "" }]);
  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));

  const buildWAMessage = () => {
    const lines = items
      .filter(i => i.repuesto.trim())
      .map((item, idx) =>
        `${idx + 1}. ${item.repuesto}${item.modelo ? ` — Modelo: ${item.modelo}` : ""}${item.anio ? ` (${item.anio})` : ""}`
      );
    return `Hola, necesito repuestos para *${brandName}*:\n\n${lines.join("\n")}\n\nPor favor, ¿me pueden ayudar con cotización?`;
  };

  const handleWA = () => {
    const msg = buildWAMessage();
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleAddToCart = () => {
    const valid = items.filter(i => i.repuesto.trim());
    if (valid.length > 0) {
      onAddToCart(valid, brandName);
      onClose();
    }
  };

  const hasContent = items.some(i => i.repuesto.trim());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a1f6e] to-[#2a2f8e] px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-[#e8121a] text-xs font-bold uppercase tracking-widest">Solicitar repuestos</p>
            <h2 className="text-white font-black text-xl">{brandName}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white/70" />
          </button>
        </div>

        {/* Items */}
        <div className="p-6 max-h-[55vh] overflow-y-auto space-y-4">
          {items.map((item, index) => (
            <div key={index} className="bg-slate-50 rounded-xl p-4 relative">
              {items.length > 1 && (
                <button
                  onClick={() => removeItem(index)}
                  className="absolute top-3 right-3 p-1 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wide">
                Ítem {index + 1}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Modelo</label>
                  <input
                    type="text"
                    placeholder="ej. Corolla, RAV4..."
                    value={item.modelo}
                    onChange={e => updateItem(index, "modelo", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1f6e]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Año</label>
                  <input
                    type="text"
                    placeholder="ej. 2022"
                    value={item.anio}
                    onChange={e => updateItem(index, "anio", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1f6e]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Repuesto que busca *</label>
                <textarea
                  placeholder="ej. Pastillas de freno delanteras, filtro de aceite..."
                  value={item.repuesto}
                  onChange={e => updateItem(index, "repuesto", e.target.value)}
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1f6e] resize-none"
                />
              </div>
            </div>
          ))}

          <button
            onClick={addItem}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-[#1a1f6e] text-slate-400 hover:text-[#1a1f6e] py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" />
            Agregar otro repuesto
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col gap-3">
          <button
            onClick={handleWA}
            disabled={!hasContent}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm"
          >
            <MessageCircle className="h-4 w-4" />
            Enviar por WhatsApp
          </button>
          <button
            onClick={handleAddToCart}
            disabled={!hasContent}
            className="w-full flex items-center justify-center gap-2 bg-[#1a1f6e] hover:bg-[#141a5e] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm"
          >
            <ShoppingCart className="h-4 w-4" />
            Agregar al carrito de cotización
          </button>
          <p className="text-xs text-slate-400 text-center">
            Nuestro equipo le responderá a la brevedad con disponibilidad y precios.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Cart Drawer ────────────────────────────────────────────────────────────────
function CartDrawer({
  products,
  repuestos,
  onClose,
  onUpdateQty,
  onRemoveProduct,
  onRemoveRepuestoGroup,
  onEnviar,
  sending,
  sent,
}: {
  products: CartItem[];
  repuestos: CartRepuestoGroup[];
  onClose: () => void;
  onUpdateQty: (id: string, qty: number) => void;
  onRemoveProduct: (id: string) => void;
  onRemoveRepuestoGroup: (brand: string) => void;
  onEnviar: (notas: string) => void;
  sending: boolean;
  sent: boolean;
}) {
  const [notas, setNotas] = useState("");
  const total = products.reduce((s, i) => s + i.producto.precio * i.cantidad, 0);
  const totalItems = products.length + repuestos.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-blue-900" />
            <h2 className="font-black text-slate-900 text-lg">Mi cotización</h2>
            <span className="bg-blue-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {totalItems}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {sent ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">¡Cotización enviada!</h3>
            <p className="text-slate-500 text-sm mb-6">
              Recibirá nuestra respuesta en su panel y por correo electrónico.
            </p>
            <Button onClick={onClose}>Cerrar</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {totalItems === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-16">
                  <ShoppingCart className="h-12 w-12 mb-3 text-slate-200" />
                  <p className="text-sm font-medium">El carrito está vacío</p>
                  <p className="text-xs mt-1">Selecciona una marca o busca en el catálogo</p>
                </div>
              ) : (
                <>
                  {/* Repuesto groups */}
                  {repuestos.map(group => (
                    <div key={group.brand} className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-[#1a1f6e]" />
                          <span className="font-bold text-slate-900 text-sm">{group.brand}</span>
                        </div>
                        <button
                          onClick={() => onRemoveRepuestoGroup(group.brand)}
                          className="p-1 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {group.items.map((item, i) => (
                          <div key={i} className="text-xs text-slate-600 flex gap-1">
                            <span className="text-slate-400">{i + 1}.</span>
                            <span>
                              <span className="font-medium">{item.repuesto}</span>
                              {item.modelo && <span className="text-slate-400"> · {item.modelo}</span>}
                              {item.anio && <span className="text-slate-400"> ({item.anio})</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Product items */}
                  {products.map(({ producto, cantidad }) => (
                    <div key={producto.id} className="flex gap-3 bg-slate-50 rounded-xl p-3">
                      <div className="w-14 h-14 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                        {producto.imagenUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">{producto.nombre}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{producto.codigo}</p>
                        <p className="text-sm font-black text-blue-900 mt-1">{formatCurrency(producto.precio * cantidad)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button onClick={() => onRemoveProduct(producto.id)} className="p-1 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onUpdateQty(producto.id, cantidad - 1)}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:border-slate-300 transition-colors"
                          >
                            <Minus className="h-3 w-3 text-slate-600" />
                          </button>
                          <span className="text-sm font-bold text-slate-900 w-6 text-center">{cantidad}</span>
                          <button
                            onClick={() => onUpdateQty(producto.id, cantidad + 1)}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:border-slate-300 transition-colors"
                          >
                            <Plus className="h-3 w-3 text-slate-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {totalItems > 0 && (
              <div className="px-6 py-5 border-t border-slate-100 space-y-4">
                {products.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Subtotal referencial</span>
                    <span className="text-lg font-black text-blue-900">{formatCurrency(total)}</span>
                  </div>
                )}
                <textarea
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  placeholder="Notas adicionales (urgencia, especificaciones...)"
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none"
                />
                <button
                  onClick={() => onEnviar(notas)}
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
                >
                  {sending ? (
                    <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {sending ? "Enviando..." : `Enviar cotización · ${totalItems} ${totalItems === 1 ? "ítem" : "ítems"}`}
                </button>
                <p className="text-xs text-slate-400 text-center">
                  El precio final puede variar según disponibilidad y condiciones comerciales.
                </p>
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Product Card ───────────────────────────────────────────────────────────────
function ProductCard({
  producto,
  onAgregar,
  onVerDetalle,
  enCarrito,
}: {
  producto: Producto;
  onAgregar: (p: Producto) => void;
  onVerDetalle: (p: Producto) => void;
  enCarrito: boolean;
}) {
  const msg = encodeURIComponent(
    `Hola, me interesa:\n• ${producto.nombre}\n• Código: ${producto.codigo}`
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
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden group hover:shadow-xl hover:border-blue-200 transition-all duration-300"
    >
      <div
        onClick={() => onVerDetalle(producto)}
        className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden cursor-pointer"
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

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {producto.destacado && (
            <div className="flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
              <Star className="h-2.5 w-2.5 fill-current" />
              Destacado
            </div>
          )}
          <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${!inStock ? "bg-red-100 text-red-700" : lowStock ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
            {!inStock ? "Sin stock" : lowStock ? `Últimas ${producto.stock}` : "En stock"}
          </div>
        </div>

        {enCarrito && (
          <div className="absolute top-3 right-3 bg-blue-900 text-white rounded-full p-1.5 shadow-lg">
            <Check className="h-3.5 w-3.5" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-mono text-slate-400">{producto.codigo}</span>
          {producto.marca.nombre !== "Sin marca" && (
            <span className="text-xs text-slate-400">{producto.marca.nombre}</span>
          )}
        </div>

        <h3
          onClick={() => onVerDetalle(producto)}
          className="font-bold text-slate-900 text-sm leading-snug mb-1 line-clamp-2 hover:text-blue-900 transition-colors cursor-pointer"
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

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <p className="text-xl font-black text-blue-900">{formatCurrency(producto.precio)}</p>
            <p className="text-xs text-slate-400">Inc. IGV · por {producto.unidad}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onAgregar(producto)}
              className={`text-xs font-semibold px-3 py-2 rounded-lg transition-all flex items-center gap-1 ${
                enCarrito ? "bg-green-600 hover:bg-green-700 text-white" : "bg-blue-900 hover:bg-blue-800 text-white"
              }`}
            >
              {enCarrito ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {enCarrito ? "Agregado" : "Agregar"}
            </button>
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${msg}`}
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

// ── Product Detail Modal ───────────────────────────────────────────────────────
function ProductDetailModal({
  producto,
  onClose,
  onAgregar,
  enCarrito,
}: {
  producto: Producto;
  onClose: () => void;
  onAgregar: (p: Producto) => void;
  enCarrito: boolean;
}) {
  const msg = encodeURIComponent(
    `Hola, me interesa:\n• ${producto.nombre}\n• Código: ${producto.codigo}`
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4"
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
          {producto.marca.nombre !== "Sin marca" && (
            <p className="text-slate-500 text-sm mb-1">Marca: <strong>{producto.marca.nombre}</strong></p>
          )}

          {producto.descripcion && (
            <p className="text-slate-600 text-sm mt-3 mb-4 leading-relaxed">{producto.descripcion}</p>
          )}

          {producto.modelosCompatibles.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Modelos compatibles</p>
              <div className="flex flex-wrap gap-1.5">
                {producto.modelosCompatibles.map(m => (
                  <span key={m} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">{m}</span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mt-2 mb-5">
            <div className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg ${producto.stock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {producto.stock > 0 ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {producto.stock > 0 ? `${producto.stock} ${producto.unidad} disponibles` : "Sin stock"}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-blue-900">{formatCurrency(producto.precio)}</p>
              <p className="text-xs text-slate-400">Inc. IGV · Precio por {producto.unidad}</p>
            </div>
            <div className="flex gap-3">
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${msg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <button
                onClick={() => { onAgregar(producto); onClose(); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                  enCarrito ? "bg-green-600 hover:bg-green-700 text-white" : "bg-blue-900 hover:bg-blue-800 text-white"
                }`}
              >
                {enCarrito ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {enCarrito ? "Ya en carrito" : "Agregar al carrito"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
type Tab = "marcas" | "catalogo";

export default function SocioCatalogoPage() {
  const [activeTab, setActiveTab] = useState<Tab>("marcas");

  // Catalog state
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [marcaFiltro, setMarcaFiltro] = useState("");
  const [totalProductos, setTotalProductos] = useState(0);
  const [page, setPage] = useState(1);
  const [detalle, setDetalle] = useState<Producto | null>(null);

  // Cart state
  const [cartProducts, setCartProducts] = useState<CartItem[]>([]);
  const [cartRepuestos, setCartRepuestos] = useState<CartRepuestoGroup[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Brand request modal
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

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
    setTotalProductos(data.total || 0);
    setLoading(false);
  }, [page, search, categoriaFiltro, marcaFiltro]);

  useEffect(() => {
    fetch("/api/categorias").then(r => r.json()).then(setCategorias).catch(() => {});
    fetch("/api/marcas").then(r => r.json()).then(setMarcas).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab !== "catalogo") return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(fetchProductos, 300);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [fetchProductos, activeTab]);

  const clearFiltros = () => {
    setSearch(""); setCategoriaFiltro(""); setMarcaFiltro(""); setPage(1);
  };

  const agregarProductoAlCarrito = (producto: Producto) => {
    setCartProducts(prev => {
      const exists = prev.find(i => i.producto.id === producto.id);
      if (exists) return prev;
      return [...prev, { producto, cantidad: 1 }];
    });
    setCartOpen(true);
  };

  const agregarRepuestosAlCarrito = (items: RepuestoItem[], brand: string) => {
    setCartRepuestos(prev => {
      const exists = prev.find(g => g.brand === brand);
      if (exists) {
        return prev.map(g => g.brand === brand ? { ...g, items: [...g.items, ...items] } : g);
      }
      return [...prev, { brand, items }];
    });
    setCartOpen(true);
  };

  const updateProductQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCartProducts(prev => prev.filter(i => i.producto.id !== id));
    } else {
      setCartProducts(prev => prev.map(i => i.producto.id === id ? { ...i, cantidad: qty } : i));
    }
  };

  const removeProduct = (id: string) => setCartProducts(prev => prev.filter(i => i.producto.id !== id));
  const removeRepuestoGroup = (brand: string) => setCartRepuestos(prev => prev.filter(g => g.brand !== brand));

  const enviarCotizacion = async (notas: string) => {
    setSending(true);
    await fetch("/api/socio/cotizaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartProducts.map(i => ({ productoId: i.producto.id, cantidad: i.cantidad })),
        notas: [
          notas,
          ...cartRepuestos.map(g =>
            `[${g.brand}] ${g.items.map(i => `${i.repuesto}${i.modelo ? ` (${i.modelo}${i.anio ? " " + i.anio : ""})` : ""}`).join(", ")}`
          ),
        ].filter(Boolean).join("\n"),
      }),
    });
    setSent(true);
    setSending(false);
    setCartProducts([]);
    setCartRepuestos([]);
  };

  const handleCloseCart = () => {
    setCartOpen(false);
    if (sent) setSent(false);
  };

  const tienesFiltros = search || categoriaFiltro || marcaFiltro;
  const cartIds = new Set(cartProducts.map(i => i.producto.id));
  const totalCartItems = cartProducts.length + cartRepuestos.length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Catálogo de repuestos</h1>
          <p className="text-slate-500 text-sm mt-0.5">Selecciona tu marca o busca en el catálogo</p>
        </div>

        {/* Cart button */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          <ShoppingCart className="h-4 w-4" />
          Mi cotización
          {totalCartItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
              {totalCartItems}
            </span>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        <button
          onClick={() => setActiveTab("marcas")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === "marcas"
              ? "bg-white text-[#1a1f6e] shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Car className="h-4 w-4" />
          Por marca
        </button>
        <button
          onClick={() => { setActiveTab("catalogo"); if (productos.length === 0) fetchProductos(); }}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === "catalogo"
              ? "bg-white text-[#1a1f6e] shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Search className="h-4 w-4" />
          Buscar en catálogo
        </button>
      </div>

      {/* Tab: Marcas */}
      {activeTab === "marcas" && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {VEHICLE_BRANDS.map(brand => (
              <motion.button
                key={brand.name}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedBrand(brand.name)}
                className="group flex flex-col items-start p-5 rounded-2xl text-left shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden relative"
                style={{
                  background: `linear-gradient(135deg, ${brand.color} 0%, ${brand.color}cc 100%)`,
                }}
              >
                {/* Decorative circles */}
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                <div className="absolute -bottom-6 -right-2 w-24 h-24 rounded-full bg-black/10" />

                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">
                    Repuestos para
                  </p>
                  <p className="text-lg font-black text-white leading-tight mb-3">{brand.name}</p>
                  <span className="text-2xl">{brand.emoji}</span>
                </div>
              </motion.button>
            ))}
          </div>

          <p className="text-xs text-slate-400 text-center mt-6">
            Haz clic en una marca para solicitar repuestos específicos
          </p>
        </div>
      )}

      {/* Tab: Catálogo */}
      {activeTab === "catalogo" && (
        <div>
          {/* Search + filters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
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

              <div className="relative">
                <select
                  value={categoriaFiltro}
                  onChange={e => { setCategoriaFiltro(e.target.value); setPage(1); }}
                  className="appearance-none w-full sm:w-44 border border-slate-200 rounded-xl px-4 py-2.5 text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-900"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={marcaFiltro}
                  onChange={e => { setMarcaFiltro(e.target.value); setPage(1); }}
                  className="appearance-none w-full sm:w-36 border border-slate-200 rounded-xl px-4 py-2.5 text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-900"
                >
                  <option value="">Todas las marcas</option>
                  {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>

              {tienesFiltros && (
                <button onClick={clearFiltros} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 whitespace-nowrap">
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 text-slate-400">
              <Package className="h-16 w-16 mx-auto mb-4 text-slate-200" />
              <p className="font-semibold text-slate-600 text-lg">No se encontraron productos</p>
              <p className="text-sm mt-1">Intente con otros filtros de búsqueda</p>
              {tienesFiltros && (
                <button onClick={clearFiltros} className="mt-4 text-blue-900 font-medium hover:underline">Limpiar filtros</button>
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
                    onAgregar={agregarProductoAlCarrito}
                    onVerDetalle={setDetalle}
                    enCarrito={cartIds.has(producto.id)}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Pagination */}
          {totalProductos > 12 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:border-slate-300 transition-colors">
                Anterior
              </button>
              <span className="text-sm text-slate-500">Página {page} de {Math.ceil(totalProductos / 12)}</span>
              <button disabled={page >= Math.ceil(totalProductos / 12)} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:border-slate-300 transition-colors">
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {detalle && (
          <ProductDetailModal
            producto={detalle}
            onClose={() => setDetalle(null)}
            onAgregar={agregarProductoAlCarrito}
            enCarrito={cartIds.has(detalle.id)}
          />
        )}
        {selectedBrand && (
          <BrandRequestModal
            brandName={selectedBrand}
            onClose={() => setSelectedBrand(null)}
            onAddToCart={agregarRepuestosAlCarrito}
          />
        )}
        {cartOpen && (
          <CartDrawer
            products={cartProducts}
            repuestos={cartRepuestos}
            onClose={handleCloseCart}
            onUpdateQty={updateProductQty}
            onRemoveProduct={removeProduct}
            onRemoveRepuestoGroup={removeRepuestoGroup}
            onEnviar={enviarCotizacion}
            sending={sending}
            sent={sent}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
