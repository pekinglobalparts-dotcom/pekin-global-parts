"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowLeft, ImageIcon } from "lucide-react";

const WHATSAPP = "51953096242";
const waLink = (msg: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
const soles = (n: number) => `S/ ${Number(n).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type Producto = {
  id: string;
  codigo: string | null;
  descripcion: string;
  marca: string | null;
  modelo: string | null;
  imagenUrl: string | null;
  precioPublico: number;
  destacado: boolean;
};

export default function CatalogoPage() {
  const [productos, setProductos] = useState<Producto[] | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/vitrina")
      .then(r => r.json())
      .then(d => setProductos((d.productos || []).map((p: Producto) => ({ ...p, precioPublico: Number(p.precioPublico) }))))
      .catch(() => setProductos([]));
  }, []);

  const words = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const results = useMemo(() => {
    if (!productos) return [];
    if (words.length === 0) return productos;
    return productos.filter(p => {
      const haystack = `${p.descripcion} ${p.marca ?? ""} ${p.modelo ?? ""} ${p.codigo ?? ""}`.toLowerCase();
      return words.every(w => haystack.includes(w));
    });
  }, [productos, words]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#0f1f3d] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-blue-200 hover:text-white transition-colors shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Image src="/img/logo-pekin.jpg" alt="Pekín S&A" width={120} height={39} className="h-9 w-auto object-contain" />
          <div className="ml-auto hidden sm:block">
            <a href={waLink("Hola, estoy viendo el catálogo y quiero cotizar un repuesto")} target="_blank" rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors">
              Cotizar por WhatsApp
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Catálogo de repuestos</h1>
        <p className="text-slate-500 text-sm mt-1 mb-6">
          Productos disponibles con precio y foto. ¿No encuentras lo que buscas?{" "}
          <a href={waLink("Hola, busco un repuesto que no veo en el catálogo")} target="_blank" rel="noopener noreferrer" className="text-green-600 font-semibold hover:underline">
            Escríbenos y lo cotizamos
          </a>.
        </p>

        {/* Search */}
        <div className="relative mb-5 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar repuesto, marca, modelo o código..."
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0f1f3d]"
          />
        </div>

        {productos && productos.length > 0 && (
          <p className="text-xs text-slate-400 mb-3">{results.length.toLocaleString()} producto{results.length !== 1 ? "s" : ""}</p>
        )}

        {/* Results */}
        {!productos ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="aspect-[3/4] bg-white rounded-2xl border border-slate-200 animate-pulse" />)}
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <ImageIcon className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold mb-1">Estamos armando nuestro catálogo</p>
            <p className="text-slate-400 text-sm mb-4">Dinos qué repuesto necesitas y te cotizamos al instante.</p>
            <a href={waLink("Hola, quiero cotizar un repuesto")} target="_blank" rel="noopener noreferrer"
              className="inline-block bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-colors">
              Cotizar por WhatsApp
            </a>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Search className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold mb-1">Sin resultados para tu búsqueda</p>
            <p className="text-slate-400 text-sm mb-4">Igual lo conseguimos — cotiza sin compromiso</p>
            <a href={waLink(`Hola, busco: ${search || "un repuesto"} — ¿lo tienen disponible?`)} target="_blank" rel="noopener noreferrer"
              className="inline-block bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-colors">
              Consultar por WhatsApp
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
                <div className="relative aspect-square bg-slate-100 flex items-center justify-center">
                  {p.imagenUrl ? (
                    <Image src={p.imagenUrl} alt={p.descripcion} fill className="object-cover" sizes="(max-width:640px) 50vw, 25vw" />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-slate-300" />
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <p className="text-sm font-bold text-slate-900 leading-tight line-clamp-2">{p.descripcion}</p>
                  {(p.marca || p.modelo) && (
                    <p className="text-xs text-slate-400 mt-0.5">{[p.marca, p.modelo].filter(Boolean).join(" · ")}</p>
                  )}
                  <p className="text-lg font-black text-[#0f1f3d] mt-2">{soles(p.precioPublico)}</p>
                  <a href={waLink(`Hola, me interesa: ${p.descripcion}${p.codigo ? ` (código ${p.codigo})` : ""} — precio ${soles(p.precioPublico)}`)}
                    target="_blank" rel="noopener noreferrer"
                    className="mt-auto pt-3 text-center bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 rounded-full transition-colors">
                    Pedir por WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer note */}
        <div className="mt-10 bg-[#0f1f3d] rounded-2xl p-6 text-center">
          <p className="text-white font-bold mb-1">¿No encontraste tu repuesto?</p>
          <p className="text-blue-200 text-sm mb-4">Trabajamos con todas las marcas. Envíanos el código o una foto y te cotizamos.</p>
          <a href={waLink("Hola, necesito cotizar un repuesto que no está en el catálogo")} target="_blank" rel="noopener noreferrer"
            className="inline-block bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-colors">
            Cotizar por WhatsApp
          </a>
        </div>
      </main>
    </div>
  );
}
