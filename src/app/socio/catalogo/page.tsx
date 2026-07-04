"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, MessageCircle, ShoppingCart,
  Check, Plus, Trash2, Send, Car, Cog,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51953096242";

// ── Types ──────────────────────────────────────────────────────────────────────
interface RepuestoItem {
  modelo: string;
  anio: string;
  repuesto: string;
}

interface CartRepuestoGroup {
  brand: string;
  items: RepuestoItem[];
}

// Catálogo de códigos (matriz automotriz): parte, marca, modelo, codigo
type CatalogData = { motores: [string, string, string, string][] };
interface CatalogGroup { p: string; m: string; mo: string; codes: string[] }

// ── Brand data ─────────────────────────────────────────────────────────────────
const CDN = "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized";
const VEHICLE_BRANDS = [
  { name: "Toyota",      color: "#CC0000",  logo: `${CDN}/toyota.png` },
  { name: "Nissan",      color: "#C3002F",  logo: `${CDN}/nissan.png` },
  { name: "Mitsubishi",  color: "#E60026",  logo: `${CDN}/mitsubishi.png` },
  { name: "Hyundai",     color: "#002C5F",  logo: `${CDN}/hyundai.png` },
  { name: "Kia",         color: "#05141F",  logo: `${CDN}/kia.png` },
  { name: "Volkswagen",  color: "#001E50",  logo: `${CDN}/volkswagen.png` },
  { name: "Chevrolet",   color: "#D4AF37",  logo: `${CDN}/chevrolet.png` },
  { name: "Ford",        color: "#003DA5",  logo: `${CDN}/ford.png` },
  { name: "BYD",         color: "#1DB954",  logo: `${CDN}/byd.png` },
  { name: "Chery",       color: "#CC0000",  logo: `${CDN}/chery.png` },
  { name: "JAC",         color: "#003087",  logo: `${CDN}/jac.png` },
  { name: "Jetour",      color: "#1a1a2e",  logo: `${CDN}/jetour.png` },
  { name: "Jeep",        color: "#1B1B1B",  logo: `${CDN}/jeep.png` },
  { name: "Honda",       color: "#CC0000",  logo: `${CDN}/honda.png` },
  { name: "Mazda",       color: "#910000",  logo: `${CDN}/mazda.png` },
  { name: "Suzuki",      color: "#003087",  logo: `${CDN}/suzuki.png` },
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
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(buildWAMessage())}`, "_blank");
  };

  const handleAddToCart = () => {
    const valid = items.filter(i => i.repuesto.trim());
    if (valid.length > 0) { onAddToCart(valid, brandName); onClose(); }
  };

  const hasContent = items.some(i => i.repuesto.trim());

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#1a1f6e] to-[#2a2f8e] px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-[#e8121a] text-xs font-bold uppercase tracking-widest">Solicitar repuestos</p>
            <h2 className="text-white font-black text-xl">{brandName}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="h-5 w-5 text-white/70" />
          </button>
        </div>

        <div className="p-6 max-h-[55vh] overflow-y-auto space-y-4">
          {items.map((item, index) => (
            <div key={index} className="bg-slate-50 rounded-xl p-4 relative">
              {items.length > 1 && (
                <button onClick={() => removeItem(index)} className="absolute top-3 right-3 p-1 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wide">Ítem {index + 1}</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Modelo</label>
                  <input type="text" placeholder="ej. Corolla, RAV4..." value={item.modelo}
                    onChange={e => updateItem(index, "modelo", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1f6e]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Año</label>
                  <input type="text" placeholder="ej. 2022" value={item.anio}
                    onChange={e => updateItem(index, "anio", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1f6e]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Repuesto que busca *</label>
                <textarea placeholder="ej. Pastillas de freno delanteras, filtro de aceite..." value={item.repuesto}
                  onChange={e => updateItem(index, "repuesto", e.target.value)} rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1f6e] resize-none" />
              </div>
            </div>
          ))}
          <button onClick={addItem} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-[#1a1f6e] text-slate-400 hover:text-[#1a1f6e] py-3 rounded-xl text-sm font-semibold transition-colors">
            <Plus className="h-4 w-4" />
            Agregar otro repuesto
          </button>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex flex-col gap-3">
          <button onClick={handleWA} disabled={!hasContent}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm">
            <MessageCircle className="h-4 w-4" />
            Enviar por WhatsApp
          </button>
          <button onClick={handleAddToCart} disabled={!hasContent}
            className="w-full flex items-center justify-center gap-2 bg-[#1a1f6e] hover:bg-[#141a5e] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm">
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

// ── Cart Drawer (solo cotización de repuestos, sin precios) ─────────────────────
function CartDrawer({
  repuestos,
  onClose,
  onRemoveRepuestoGroup,
  onEnviar,
  sending,
  sent,
}: {
  repuestos: CartRepuestoGroup[];
  onClose: () => void;
  onRemoveRepuestoGroup: (brand: string) => void;
  onEnviar: (notas: string) => void;
  sending: boolean;
  sent: boolean;
}) {
  const [notas, setNotas] = useState("");
  const totalItems = repuestos.length;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-blue-900" />
            <h2 className="font-black text-slate-900 text-lg">Mi cotización</h2>
            <span className="bg-blue-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalItems}</span>
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
            <p className="text-slate-500 text-sm mb-6">Recibirá nuestra respuesta en su panel y por correo electrónico.</p>
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
                repuestos.map(group => (
                  <div key={group.brand} className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-[#1a1f6e]" />
                        <span className="font-bold text-slate-900 text-sm">{group.brand}</span>
                      </div>
                      <button onClick={() => onRemoveRepuestoGroup(group.brand)} className="p-1 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-colors">
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
                ))
              )}
            </div>

            {totalItems > 0 && (
              <div className="px-6 py-5 border-t border-slate-100 space-y-4">
                <textarea value={notas} onChange={e => setNotas(e.target.value)}
                  placeholder="Notas adicionales (urgencia, especificaciones...)" rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none" />
                <button onClick={() => onEnviar(notas)} disabled={sending}
                  className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors text-sm">
                  {sending ? <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" /> : <Send className="h-4 w-4" />}
                  {sending ? "Enviando..." : `Enviar cotización · ${totalItems} ${totalItems === 1 ? "grupo" : "grupos"}`}
                </button>
                <p className="text-xs text-slate-400 text-center">
                  El precio final se le enviará según disponibilidad y condiciones comerciales.
                </p>
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
type Tab = "marcas" | "catalogo";
const PAGE_SIZE = 40;

export default function SocioCatalogoPage() {
  const [activeTab, setActiveTab] = useState<Tab>("marcas");

  // Catálogo de códigos
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [search, setSearch] = useState("");
  const [marca, setMarca] = useState("TODAS");
  const [parte, setParte] = useState("TODAS");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [addedKey, setAddedKey] = useState<string | null>(null);

  // Cart state
  const [cartRepuestos, setCartRepuestos] = useState<CartRepuestoGroup[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Brand request modal
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  useEffect(() => {
    fetch("/catalogo-data.json").then(r => r.json()).then(setCatalog).catch(() => {});
  }, []);

  useEffect(() => { setLimit(PAGE_SIZE); }, [search, marca, parte]);

  const marcas = useMemo(() => {
    if (!catalog) return [];
    return ["TODAS", ...Array.from(new Set(catalog.motores.map(e => e[1]))).sort()];
  }, [catalog]);

  const partes = useMemo(() => {
    if (!catalog) return [];
    const src = marca === "TODAS" ? catalog.motores : catalog.motores.filter(e => e[1] === marca);
    return ["TODAS", ...Array.from(new Set(src.map(e => e[0]))).sort()];
  }, [catalog, marca]);

  const grouped = useMemo<CatalogGroup[]>(() => {
    if (!catalog) return [];
    const map = new Map<string, CatalogGroup>();
    for (const [p, m, mo, c] of catalog.motores) {
      const key = `${p}|${m}|${mo}`;
      const g = map.get(key);
      if (g) { if (!g.codes.includes(c)) g.codes.push(c); }
      else map.set(key, { p, m, mo, codes: [c] });
    }
    return Array.from(map.values());
  }, [catalog]);

  const words = search.trim().toLowerCase().split(/\s+/).filter(Boolean);

  const results = useMemo(() => {
    return grouped.filter(g => {
      if (marca !== "TODAS" && g.m !== marca) return false;
      if (parte !== "TODAS" && g.p !== parte) return false;
      if (words.length === 0) return true;
      const haystack = `${g.p} ${g.m} ${g.mo} ${g.codes.join(" ")}`.toLowerCase();
      return words.every(w => haystack.includes(w));
    });
  }, [grouped, words, marca, parte]);

  const visible = results.slice(0, limit);

  const agregarRepuestosAlCarrito = (items: RepuestoItem[], brand: string) => {
    setCartRepuestos(prev => {
      const exists = prev.find(g => g.brand === brand);
      if (exists) return prev.map(g => g.brand === brand ? { ...g, items: [...g.items, ...items] } : g);
      return [...prev, { brand, items }];
    });
  };

  const agregarCatalogoAlCarrito = (g: CatalogGroup) => {
    const repuesto = `${g.p} — ${g.mo} · código: ${g.codes.join(" / ")}`;
    agregarRepuestosAlCarrito([{ modelo: g.mo, anio: "", repuesto }], g.m);
    const key = `${g.p}|${g.m}|${g.mo}`;
    setAddedKey(key);
    setTimeout(() => setAddedKey(k => k === key ? null : k), 1500);
  };

  const removeRepuestoGroup = (brand: string) => setCartRepuestos(prev => prev.filter(g => g.brand !== brand));

  const enviarCotizacion = async (notas: string) => {
    setSending(true);
    await fetch("/api/socio/cotizaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [],
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
    setCartRepuestos([]);
  };

  const handleCloseCart = () => { setCartOpen(false); if (sent) setSent(false); };

  const totalCartItems = cartRepuestos.length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Catálogo de repuestos</h1>
          <p className="text-slate-500 text-sm mt-0.5">Selecciona tu marca o busca por código y modelo</p>
        </div>
        <button onClick={() => setCartOpen(true)}
          className="relative flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors">
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">Mi cotización</span>
          {totalCartItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
              {totalCartItems}
            </span>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        <button onClick={() => setActiveTab("marcas")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "marcas" ? "bg-white text-[#1a1f6e] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          <Car className="h-4 w-4" />
          Por marca
        </button>
        <button onClick={() => setActiveTab("catalogo")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "catalogo" ? "bg-white text-[#1a1f6e] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          <Cog className="h-4 w-4" />
          Catálogo por código
        </button>
      </div>

      {/* Tab: Marcas */}
      {activeTab === "marcas" && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {VEHICLE_BRANDS.map(brand => (
              <motion.button key={brand.name} whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedBrand(brand.name)}
                className="group flex flex-col items-start p-5 rounded-2xl text-left shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden relative"
                style={{ background: `linear-gradient(135deg, ${brand.color} 0%, ${brand.color}cc 100%)` }}>
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                <div className="absolute -bottom-6 -right-2 w-24 h-24 rounded-full bg-black/10" />
                <div className="relative z-10 w-full">
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">Repuestos para</p>
                  <p className="text-lg font-black text-white leading-tight mb-3">{brand.name}</p>
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={brand.logo} alt={brand.name} className="w-9 h-9 object-contain" loading="lazy" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
          <p className="text-xs text-slate-400 text-center mt-6">Haz clic en una marca para solicitar repuestos específicos</p>
        </div>
      )}

      {/* Tab: Catálogo por código */}
      {activeTab === "catalogo" && (
        <div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" placeholder="Buscar por código, modelo o parte..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
              </div>
              <select value={marca} onChange={e => { setMarca(e.target.value); setParte("TODAS"); }}
                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-900">
                {marcas.map(m => <option key={m} value={m}>{m === "TODAS" ? "Todas las marcas" : m}</option>)}
              </select>
              <select value={parte} onChange={e => setParte(e.target.value)}
                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 max-w-full sm:max-w-[220px]">
                {partes.map(p => <option key={p} value={p}>{p === "TODAS" ? "Todas las partes" : p}</option>)}
              </select>
            </div>
          </div>

          {catalog && (
            <p className="text-xs text-slate-400 mb-3">{results.length.toLocaleString()} resultado{results.length !== 1 ? "s" : ""}</p>
          )}

          {!catalog ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
            </div>
          ) : visible.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <Search className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold mb-1">Sin resultados para tu búsqueda</p>
              <p className="text-slate-400 text-sm">Prueba con otro código, marca o modelo</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {visible.map((g, i) => {
                  const key = `${g.p}|${g.m}|${g.mo}`;
                  const justAdded = addedKey === key;
                  return (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 leading-tight">{g.p}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{g.m} · {g.mo}</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {g.codes.map(c => (
                            <span key={c} className="text-xs font-mono font-bold text-[#0f1f3d] bg-slate-100 px-2 py-0.5 rounded">{c}</span>
                          ))}
                          {g.codes.length > 1 && (
                            <span className="text-[10px] text-slate-400 self-center">({g.codes.length} alternativas)</span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => agregarCatalogoAlCarrito(g)}
                        className={`shrink-0 text-xs font-bold px-3.5 py-2 rounded-full transition-colors flex items-center gap-1 ${justAdded ? "bg-green-600 text-white" : "bg-blue-900 hover:bg-blue-800 text-white"}`}>
                        {justAdded ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        {justAdded ? "Agregado" : "Cotizar"}
                      </button>
                    </div>
                  );
                })}
              </div>
              {results.length > limit && (
                <button onClick={() => setLimit(l => l + PAGE_SIZE)}
                  className="w-full mt-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-slate-300 transition-colors">
                  Ver más ({(results.length - limit).toLocaleString()} restantes)
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {selectedBrand && (
          <BrandRequestModal brandName={selectedBrand} onClose={() => setSelectedBrand(null)} onAddToCart={agregarRepuestosAlCarrito} />
        )}
        {cartOpen && (
          <CartDrawer
            repuestos={cartRepuestos}
            onClose={handleCloseCart}
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
