// Índice de repuestos para las páginas de aterrizaje SEO.
// Se arma a partir de public/catalogo-data.json (≈5.600 repuestos de motor por
// marca y modelo). Genera páginas indexables tipo "anillos para Toyota Hilux"
// que captan búsquedas long-tail. Todo server-side.
import { readFileSync } from "fs";
import path from "path";

export interface ModeloInfo { slug: string; label: string; partes: number; }
export interface MarcaInfo { slug: string; label: string; modelos: ModeloInfo[]; }
export interface ParteModelo { nombre: string; codigos: string[]; }

type Fila = [string, string, string, string]; // [parte, marca, modelo, codigo]

export function slugify(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "x";
}
const titulo = (s: string) =>
  s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()).replace(/\bC\.c\b/i, "c.c.");

interface Index {
  marcas: MarcaInfo[];
  marcaPorSlug: Map<string, { label: string; original: string }>;
  modeloPorSlug: Map<string, { marcaSlug: string; label: string; original: string }>; // key: `${marcaSlug}/${modeloSlug}`
  partes: Map<string, ParteModelo[]>; // key: `${marcaSlug}/${modeloSlug}`
}

let cache: Index | null = null;

function build(): Index {
  let filas: Fila[] = [];
  try {
    const raw = readFileSync(path.join(process.cwd(), "public", "catalogo-data.json"), "utf-8");
    filas = (JSON.parse(raw).motores || []) as Fila[];
  } catch { filas = []; }

  const marcaMap = new Map<string, { label: string; original: string; modelos: Map<string, { label: string; original: string; partes: Map<string, Set<string>> }> }>();

  for (const row of filas) {
    const [parteRaw, marcaRaw, modeloRaw, codRaw] = row;
    if (!marcaRaw || !modeloRaw || !parteRaw) continue;
    const mSlug = slugify(marcaRaw);
    const moSlug = slugify(modeloRaw);
    let marca = marcaMap.get(mSlug);
    if (!marca) { marca = { label: titulo(marcaRaw), original: marcaRaw, modelos: new Map() }; marcaMap.set(mSlug, marca); }
    let modelo = marca.modelos.get(moSlug);
    if (!modelo) { modelo = { label: titulo(modeloRaw), original: modeloRaw, partes: new Map() }; marca.modelos.set(moSlug, modelo); }
    const pNombre = titulo(parteRaw);
    let cods = modelo.partes.get(pNombre);
    if (!cods) { cods = new Set(); modelo.partes.set(pNombre, cods); }
    if (codRaw) cods.add(codRaw);
  }

  const marcas: MarcaInfo[] = [];
  const marcaPorSlug = new Map<string, { label: string; original: string }>();
  const modeloPorSlug = new Map<string, { marcaSlug: string; label: string; original: string }>();
  const partes = new Map<string, ParteModelo[]>();

  for (const [mSlug, marca] of [...marcaMap.entries()].sort((a, b) => a[1].label.localeCompare(b[1].label))) {
    marcaPorSlug.set(mSlug, { label: marca.label, original: marca.original });
    const modelos: ModeloInfo[] = [];
    for (const [moSlug, modelo] of [...marca.modelos.entries()].sort((a, b) => a[1].label.localeCompare(b[1].label))) {
      const key = `${mSlug}/${moSlug}`;
      modeloPorSlug.set(key, { marcaSlug: mSlug, label: modelo.label, original: modelo.original });
      const lista: ParteModelo[] = [...modelo.partes.entries()]
        .map(([nombre, cods]) => ({ nombre, codigos: [...cods].slice(0, 8) }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      partes.set(key, lista);
      modelos.push({ slug: moSlug, label: modelo.label, partes: lista.length });
    }
    marcas.push({ slug: mSlug, label: marca.label, modelos });
  }

  return { marcas, marcaPorSlug, modeloPorSlug, partes };
}

function idx(): Index { if (!cache) cache = build(); return cache; }

export function getMarcas(): MarcaInfo[] { return idx().marcas; }
export function getMarca(slug: string): MarcaInfo | null { return idx().marcas.find(m => m.slug === slug) || null; }
export function getModelo(marcaSlug: string, modeloSlug: string): { marca: MarcaInfo; modelo: ModeloInfo; partes: ParteModelo[] } | null {
  const marca = getMarca(marcaSlug);
  if (!marca) return null;
  const modelo = marca.modelos.find(m => m.slug === modeloSlug);
  if (!modelo) return null;
  return { marca, modelo, partes: idx().partes.get(`${marcaSlug}/${modeloSlug}`) || [] };
}
export function allModeloParams(): { marca: string; modelo: string }[] {
  const out: { marca: string; modelo: string }[] = [];
  for (const m of idx().marcas) for (const mo of m.modelos) out.push({ marca: m.slug, modelo: mo.slug });
  return out;
}
