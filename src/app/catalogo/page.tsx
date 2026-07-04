"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowLeft } from "lucide-react";

const WHATSAPP = "51953096242";
const waLink = (msg: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

type CatalogData = {
  motores: [string, string, string, string][]; // parte, marca, modelo, codigo
};

const PAGE_SIZE = 50;

export default function CatalogoPage() {
  const [data, setData] = useState<CatalogData | null>(null);
  const [search, setSearch] = useState("");
  const [marca, setMarca] = useState("TODAS");
  const [parte, setParte] = useState("TODAS");
  const [limit, setLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    fetch("/catalogo-data.json")
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  useEffect(() => { setLimit(PAGE_SIZE); }, [search, marca, parte]);

  const marcas = useMemo(() => {
    if (!data) return [];
    return ["TODAS", ...Array.from(new Set(data.motores.map(e => e[1]))).sort()];
  }, [data]);

  const partes = useMemo(() => {
    if (!data) return [];
    const src = marca === "TODAS" ? data.motores : data.motores.filter(e => e[1] === marca);
    return ["TODAS", ...Array.from(new Set(src.map(e => e[0]))).sort()];
  }, [data, marca]);

  const q = search.trim().toLowerCase();

  const results = useMemo(() => {
    if (!data) return [];
    return data.motores.filter(([p, m, mo, c]) =>
      (marca === "TODAS" || m === marca) &&
      (parte === "TODAS" || p === parte) &&
      (!q || p.toLowerCase().includes(q) || mo.toLowerCase().includes(q) || c.toLowerCase().includes(q) || m.toLowerCase().includes(q))
    );
  }, [data, q, marca, parte]);

  const visible = results.slice(0, limit);

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
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Catálogo de partes de motor</h1>
        <p className="text-slate-500 text-sm mt-1 mb-6">
          Busca por código, marca, modelo o tipo de parte. ¿No encuentras lo que buscas?{" "}
          <a href={waLink("Hola, busco un repuesto que no encuentro en el catálogo")} target="_blank" rel="noopener noreferrer" className="text-green-600 font-semibold hover:underline">
            Escríbenos y lo cotizamos
          </a>.
        </p>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar código, modelo o motor..."
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0f1f3d]"
            />
          </div>
          <select value={marca} onChange={e => { setMarca(e.target.value); setParte("TODAS"); }}
            className="border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0f1f3d]">
            {marcas.map(m => <option key={m} value={m}>{m === "TODAS" ? "Todas las marcas" : m}</option>)}
          </select>
          <select value={parte} onChange={e => setParte(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0f1f3d] max-w-full sm:max-w-[240px]">
            {partes.map(p => <option key={p} value={p}>{p === "TODAS" ? "Todas las partes" : p}</option>)}
          </select>
        </div>

        {/* Results count */}
        {data && (
          <p className="text-xs text-slate-400 mb-3">{results.length.toLocaleString()} resultado{results.length !== 1 ? "s" : ""}</p>
        )}

        {/* Results */}
        {!data ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
          </div>
        ) : visible.length === 0 ? (
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
          <>
            <div className="space-y-2">
              {(visible as [string,string,string,string][]).map(([p, m, mo, c], i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 leading-tight">{p}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{m} · {mo}</p>
                    <p className="text-xs font-mono font-bold text-[#0f1f3d] mt-1 bg-slate-100 inline-block px-2 py-0.5 rounded">{c}</p>
                  </div>
                  <a href={waLink(`Hola, quiero cotizar: ${p} para ${m} ${mo} — código ${c}`)} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3.5 py-2 rounded-full transition-colors">
                    Cotizar
                  </a>
                </div>
              ))}
            </div>
            {results.length > limit && (
              <button onClick={() => setLimit(l => l + PAGE_SIZE)}
                className="w-full mt-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-slate-300 transition-colors">
                Ver más ({(results.length - limit).toLocaleString()} restantes)
              </button>
            )}
          </>
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
