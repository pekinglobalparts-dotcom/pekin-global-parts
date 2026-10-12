"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users, Plus, X, Check, Pencil, Trash2, MessageCircle, Bell, CalendarClock,
  TrendingUp, AlertTriangle, Mail, Clock, Inbox, Search, Zap,
  Sparkles, Package, BarChart3, DollarSign,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Seguimiento { id: string; prospectoId: string | null; titulo: string; fecha: string; hecho: boolean }
interface Prospecto {
  id: string;
  nombre: string;
  telefono: string | null;
  empresa: string | null;
  origen: string;
  interes: string | null;
  etapa: string;
  valorEstimado: number | null;
  notas: string | null;
  createdAt: string;
  seguimientos: Seguimiento[];
}

interface Cliente {
  id: string; razonSocial: string; telefono: string; email: string; sector: string;
  ciudad: string | null; status: string; lineaCredito: number; creditoUtilizado: number;
  totalPedidos: number; totalFacturado: number; montoPorCobrar: number;
  cotizacionesPendientes: number; facturasVencidas: number;
  ultimaCompra: string | null; diasSinComprar: number | null;
  temperatura: "NUEVO" | "ACTIVO" | "RIESGO" | "DORMIDO"; wa: string | null;
}

interface Accion {
  clave: string;
  tipo: string;
  esOportunidad: boolean;
  montoPotencial: number | null;
  prioridad: number; icono: string; titulo: string; detalle: string;
  cliente: { id: string; nombre: string; telefono: string; email: string };
  canales: ("WHATSAPP" | "EMAIL")[];
  wa: string | null; mensajeWhatsApp: string;
  email: { asunto: string } | null;
}

interface ProductoAgg { nombre: string; cantidad: number; monto: number; veces: number }
interface Ficha360 {
  cliente: Cliente;
  compras: { id: string; numero: string; fecha: string; total: number; status: string; items: { nombre: string; cantidad: number; subtotal: number }[] }[];
  topComprados: ProductoAgg[];
  topCotizados: ProductoAgg[];
  conversion: { cotizaciones: number; convertidas: number; tasa: number };
  cotizacionesAbiertas: { numero: string; total: number | null; dias: number; status: string }[];
  facturas: { pagadas: number; pendientes: number; vencidas: number; porVencer: number; totalPagado: number; totalPorCobrar: number; diasPromedioPago: number | null };
  ticketPromedio: number | null;
  frecuenciaDias: number | null;
  proximaCompra: string | null;
}

const waBuild = (tel: string | null, texto: string) => {
  if (!tel) return null;
  let d = tel.replace(/\D/g, "");
  if (d.length === 9) d = "51" + d;
  return `https://wa.me/${d}?text=${encodeURIComponent(texto)}`;
};

const ETAPAS = ["NUEVO", "CONTACTADO", "COTIZADO", "NEGOCIACION", "GANADO", "PERDIDO"] as const;
const ETAPA_LABEL: Record<string, string> = {
  NUEVO: "Nuevo", CONTACTADO: "Contactado", COTIZADO: "Cotizado",
  NEGOCIACION: "Negociación", GANADO: "Ganado", PERDIDO: "Perdido",
};
const ETAPA_COLOR: Record<string, string> = {
  NUEVO: "bg-slate-500", CONTACTADO: "bg-blue-500", COTIZADO: "bg-indigo-500",
  NEGOCIACION: "bg-amber-500", GANADO: "bg-emerald-500", PERDIDO: "bg-rose-500",
};
const ORIGENES = ["WHATSAPP", "WEB", "REFERIDO", "OTRO"];
const ORIGEN_LABEL: Record<string, string> = { WHATSAPP: "WhatsApp", WEB: "Web", REFERIDO: "Referido", OTRO: "Otro" };
const ORIGEN_COLOR: Record<string, string> = {
  WHATSAPP: "bg-green-100 text-green-700", WEB: "bg-blue-100 text-blue-700",
  REFERIDO: "bg-purple-100 text-purple-700", OTRO: "bg-slate-100 text-slate-600",
};

const TEMP_LABEL: Record<string, string> = { NUEVO: "Nuevo", ACTIVO: "Activo", RIESGO: "En riesgo", DORMIDO: "Dormido" };
const TEMP_COLOR: Record<string, string> = {
  NUEVO: "bg-blue-100 text-blue-700", ACTIVO: "bg-emerald-100 text-emerald-700",
  RIESGO: "bg-amber-100 text-amber-700", DORMIDO: "bg-rose-100 text-rose-700",
};

const hoyStr = () => new Date().toISOString().slice(0, 10);
const waLink = (tel: string | null, nombre: string) => {
  if (!tel) return null;
  let d = tel.replace(/\D/g, "");
  if (d.length === 9) d = "51" + d;
  return `https://wa.me/${d}?text=${encodeURIComponent(`Hola ${nombre}, le saluda Pekín Global Parts 👋`)}`;
};

interface Form {
  nombre: string; telefono: string; empresa: string; origen: string;
  interes: string; etapa: string; valorEstimado: string; notas: string;
}
const emptyForm: Form = { nombre: "", telefono: "", empresa: "", origen: "WHATSAPP", interes: "", etapa: "NUEVO", valorEstimado: "", notas: "" };

type Tab = "acciones" | "clientes" | "prospectos";

export default function CRMPage() {
  const [tab, setTab] = useState<Tab>("acciones");
  const [denied, setDenied] = useState(false);

  // Prospectos
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [segFor, setSegFor] = useState<Prospecto | null>(null);
  const [segTitulo, setSegTitulo] = useState("");
  const [segFecha, setSegFecha] = useState(hoyStr());

  // Acciones automáticas
  const [acciones, setAcciones] = useState<Accion[]>([]);
  const [loadingAcc, setLoadingAcc] = useState(true);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [flash, setFlash] = useState<Record<string, string>>({});
  const [accFiltro, setAccFiltro] = useState<"TODAS" | "OPORTUNIDAD" | "TAREA">("TODAS");
  const [iaBusy, setIaBusy] = useState<Record<string, boolean>>({});

  // Ficha 360
  const [ficha, setFicha] = useState<Ficha360 | null>(null);
  const [loadingFicha, setLoadingFicha] = useState(false);

  // Clientes
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingCli, setLoadingCli] = useState(true);
  const [filtroCli, setFiltroCli] = useState<"TODOS" | "PORCOBRAR" | "DORMIDO" | "ACTIVO">("TODOS");
  const [buscaCli, setBuscaCli] = useState("");

  // ── Loads ──
  const loadProspectos = useCallback(async () => {
    const r = await fetch("/api/admin/crm/prospectos");
    if (r.status === 401) { setDenied(true); setLoading(false); return; }
    const d = await r.json();
    setProspectos((d.prospectos || []).map((p: Prospecto) => ({ ...p, valorEstimado: p.valorEstimado != null ? Number(p.valorEstimado) : null })));
    setLoading(false);
  }, []);
  const loadAcciones = useCallback(async () => {
    setLoadingAcc(true);
    const r = await fetch("/api/admin/crm/acciones");
    if (r.status === 401) { setDenied(true); setLoadingAcc(false); return; }
    const d = await r.json();
    setAcciones(d.acciones || []);
    setLoadingAcc(false);
  }, []);
  const loadClientes = useCallback(async () => {
    setLoadingCli(true);
    const r = await fetch("/api/admin/crm/clientes");
    if (r.status === 401) { setDenied(true); setLoadingCli(false); return; }
    const d = await r.json();
    setClientes(d.clientes || []);
    setLoadingCli(false);
  }, []);

  useEffect(() => { loadProspectos(); loadAcciones(); loadClientes(); }, [loadProspectos, loadAcciones, loadClientes]);

  // ── Acciones: enviar / descartar / posponer ──
  const resolver = useCallback(async (a: Accion, accion: "ENVIAR" | "DESCARTAR" | "POSPONER", canal?: "WHATSAPP" | "EMAIL", snoozeDias?: number) => {
    setBusy(b => ({ ...b, [a.clave]: true }));
    try {
      const r = await fetch("/api/admin/crm/acciones/enviar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clave: a.clave, tipo: a.tipo, accion, canal, snoozeDias }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setFlash(f => ({ ...f, [a.clave]: d.error || "No se pudo completar." }));
        setBusy(b => ({ ...b, [a.clave]: false }));
        return;
      }
      const msg = accion === "DESCARTAR" ? "Descartada" : accion === "POSPONER" ? "Pospuesta" : canal === "EMAIL" ? "Correo enviado ✓" : "Registrado ✓";
      setFlash(f => ({ ...f, [a.clave]: msg }));
      setTimeout(() => setAcciones(prev => prev.filter(x => x.clave !== a.clave)), 900);
    } catch {
      setFlash(f => ({ ...f, [a.clave]: "Error de conexión." }));
      setBusy(b => ({ ...b, [a.clave]: false }));
    }
  }, []);
  const enviarWhatsApp = useCallback((a: Accion) => {
    if (a.wa) window.open(a.wa, "_blank", "noopener,noreferrer");
    resolver(a, "ENVIAR", "WHATSAPP");
  }, [resolver]);
  const enviarEmail = useCallback((a: Accion) => { resolver(a, "ENVIAR", "EMAIL"); }, [resolver]);
  const descartar = useCallback((a: Accion) => { resolver(a, "DESCARTAR"); }, [resolver]);
  const posponer = useCallback((a: Accion) => { resolver(a, "POSPONER", undefined, 3); }, [resolver]);
  const redactarIA = useCallback(async (a: Accion) => {
    setIaBusy(b => ({ ...b, [a.clave]: true }));
    try {
      const r = await fetch("/api/admin/crm/redactar", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clave: a.clave }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.mensaje) {
        setAcciones(prev => prev.map(x => x.clave === a.clave ? { ...x, mensajeWhatsApp: d.mensaje, wa: waBuild(x.cliente.telefono, d.mensaje) } : x));
      }
    } catch { /* ignore */ }
    setIaBusy(b => ({ ...b, [a.clave]: false }));
  }, []);
  const abrirFicha = useCallback(async (id: string) => {
    setLoadingFicha(true); setFicha(null);
    try {
      const r = await fetch(`/api/admin/crm/clientes/${id}`);
      const d = await r.json().catch(() => ({}));
      if (r.ok) setFicha(d.ficha);
    } catch { /* ignore */ }
    setLoadingFicha(false);
  }, []);

  // ── Prospecto form ──
  const abrirNuevo = () => { setForm(emptyForm); setEditId(null); setError(""); setShowForm(true); };
  const abrirEditar = (p: Prospecto) => {
    setForm({
      nombre: p.nombre, telefono: p.telefono || "", empresa: p.empresa || "", origen: p.origen,
      interes: p.interes || "", etapa: p.etapa, valorEstimado: p.valorEstimado != null ? String(p.valorEstimado) : "", notas: p.notas || "",
    });
    setEditId(p.id); setError(""); setShowForm(true);
  };
  const guardar = async () => {
    if (!form.nombre.trim()) { setError("Pon al menos el nombre."); return; }
    setSaving(true); setError("");
    const payload = {
      nombre: form.nombre.trim(), telefono: form.telefono.trim() || null, empresa: form.empresa.trim() || null,
      origen: form.origen, interes: form.interes.trim() || null, etapa: form.etapa,
      valorEstimado: form.valorEstimado ? parseFloat(form.valorEstimado) : null, notas: form.notas.trim() || null,
    };
    try {
      const r = editId
        ? await fetch(`/api/admin/crm/prospectos/${editId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/admin/crm/prospectos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (r.ok) { setShowForm(false); loadProspectos(); }
      else { const d = await r.json().catch(() => ({})); setError(d.error || "No se pudo guardar."); }
    } catch { setError("Error de conexión."); }
    setSaving(false);
  };
  const cambiarEtapa = async (p: Prospecto, etapa: string) => {
    setProspectos(prev => prev.map(x => x.id === p.id ? { ...x, etapa } : x));
    await fetch(`/api/admin/crm/prospectos/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ etapa }) });
  };
  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar este prospecto?")) return;
    await fetch(`/api/admin/crm/prospectos/${id}`, { method: "DELETE" });
    setProspectos(prev => prev.filter(p => p.id !== id));
  };
  const abrirSeg = (p: Prospecto) => { setSegFor(p); setSegTitulo(""); setSegFecha(hoyStr()); };
  const guardarSeg = async () => {
    if (!segFor || !segTitulo.trim()) return;
    await fetch("/api/admin/crm/seguimientos", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prospectoId: segFor.id, titulo: segTitulo.trim(), fecha: segFecha }),
    });
    setSegFor(null); loadProspectos();
  };
  const marcarSeg = async (s: Seguimiento) => {
    setProspectos(prev => prev.map(p => ({ ...p, seguimientos: p.seguimientos.filter(x => x.id !== s.id) })));
    await fetch(`/api/admin/crm/seguimientos/${s.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hecho: true }) });
  };

  // ── Derivados ──
  const pendientes = useMemo(() => {
    const arr: { s: Seguimiento; p: Prospecto }[] = [];
    for (const p of prospectos) for (const s of p.seguimientos) arr.push({ s, p });
    return arr.sort((a, b) => (a.s.fecha < b.s.fecha ? -1 : 1));
  }, [prospectos]);
  const activos = prospectos.filter(p => p.etapa !== "GANADO" && p.etapa !== "PERDIDO");
  const valorPipeline = activos.reduce((s, p) => s + (p.valorEstimado || 0), 0);
  const hoy = hoyStr();
  const pendHoy = pendientes.filter(x => x.s.fecha.slice(0, 10) <= hoy).length;

  const clientesFiltrados = useMemo(() => {
    const q = buscaCli.trim().toLowerCase();
    return clientes.filter(c => {
      if (filtroCli === "PORCOBRAR" && c.montoPorCobrar <= 0) return false;
      if (filtroCli === "DORMIDO" && c.temperatura !== "DORMIDO" && c.temperatura !== "RIESGO") return false;
      if (filtroCli === "ACTIVO" && c.temperatura !== "ACTIVO") return false;
      if (q && !(c.razonSocial.toLowerCase().includes(q) || (c.ciudad || "").toLowerCase().includes(q))) return false;
      return true;
    });
  }, [clientes, filtroCli, buscaCli]);
  const totalPorCobrar = useMemo(() => clientes.reduce((s, c) => s + c.montoPorCobrar, 0), [clientes]);
  const oportunidades = useMemo(() => acciones.filter(a => a.esOportunidad), [acciones]);
  const potencialTotal = useMemo(() => oportunidades.reduce((s, a) => s + (a.montoPotencial || 0), 0), [oportunidades]);
  const accionesFiltradas = useMemo(() =>
    acciones.filter(a => accFiltro === "TODAS" ? true : accFiltro === "OPORTUNIDAD" ? a.esOportunidad : !a.esOportunidad),
    [acciones, accFiltro]);

  if (denied) {
    return (
      <div className="p-8 text-center text-slate-500">
        <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-amber-400" />
        <p className="font-semibold text-slate-700">Acceso restringido</p>
      </div>
    );
  }

  const TabBtn = ({ id, label, icon: Icon, badge }: { id: Tab; label: string; icon: typeof Zap; badge?: number }) => (
    <button
      onClick={() => setTab(id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shrink-0 ${
        tab === id ? "bg-[#0f1f3d] text-white shadow" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
      {badge != null && badge > 0 && (
        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${tab === id ? "bg-white/20 text-white" : "bg-red-100 text-red-700"}`}>{badge}</span>
      )}
    </button>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Users className="h-6 w-6 text-[#0f1f3d]" /> CRM</h1>
        <p className="text-slate-500 text-sm mt-0.5">Tu negocio en piloto automático: el sistema revisa tus datos y te dice a quién contactar y qué decirle. Tú solo apruebas.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <TabBtn id="acciones" label="Acciones sugeridas" icon={Zap} badge={acciones.length} />
        <TabBtn id="clientes" label="Clientes" icon={Users} badge={clientes.length} />
        <TabBtn id="prospectos" label="Prospectos" icon={TrendingUp} badge={activos.length} />
      </div>

      {/* ───────────── ACCIONES ───────────── */}
      {tab === "acciones" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[#0f1f3d] to-[#16294f] rounded-2xl p-5 text-white flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0"><Zap className="h-6 w-6 text-amber-300" /></div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-lg leading-tight">{acciones.length} acción(es) · {oportunidades.length} oportunidad(es)</p>
              <p className="text-blue-200 text-sm">
                {potencialTotal > 0 ? <>Potencial en juego: <span className="font-bold text-amber-300">{formatCurrency(potencialTotal)}</span>. </> : null}
                Generadas de tus datos. Revisa y aprueba.
              </p>
            </div>
            <button onClick={loadAcciones} className="text-blue-200 hover:text-white text-xs font-bold underline shrink-0">Actualizar</button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {([["TODAS", `Todas (${acciones.length})`], ["OPORTUNIDAD", `💰 Oportunidades (${oportunidades.length})`], ["TAREA", `Tareas (${acciones.length - oportunidades.length})`]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setAccFiltro(k)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border ${accFiltro === k ? "bg-[#0f1f3d] text-white border-[#0f1f3d]" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>{l}</button>
            ))}
          </div>

          {loadingAcc ? (
            <div className="p-10 text-center text-slate-400 text-sm">Analizando tus datos…</div>
          ) : accionesFiltradas.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
              <Inbox className="h-10 w-10 mx-auto mb-3 text-emerald-400" />
              <p className="font-bold text-slate-700">{acciones.length === 0 ? "¡Todo al día!" : "Nada en este filtro"}</p>
              <p className="text-slate-400 text-sm mt-1">{acciones.length === 0 ? "No hay acciones pendientes por ahora. Vuelve más tarde o actualiza." : "Prueba con otro filtro."}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accionesFiltradas.map(a => {
                const fl = flash[a.clave];
                const isBusy = busy[a.clave];
                const ia = iaBusy[a.clave];
                return (
                  <div key={a.clave} className={`bg-white border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 ${a.esOportunidad ? "border-emerald-200 border-l-4 border-l-emerald-500" : "border-slate-200"}`}>
                    <div className="text-2xl shrink-0">{a.icono}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 leading-tight">{a.titulo}</p>
                        {a.montoPotencial ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> Potencial {formatCurrency(a.montoPotencial)}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{a.detalle}</p>
                      <p className="text-xs text-slate-500 mt-1.5 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 whitespace-pre-wrap">“{a.mensajeWhatsApp}”</p>
                      <button onClick={() => redactarIA(a)} disabled={ia || isBusy}
                        className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-40">
                        <Sparkles className="h-3.5 w-3.5" /> {ia ? "Redactando…" : "Redactar con IA"}
                      </button>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0 sm:w-44 sm:justify-center">
                      {fl ? (
                        <span className={`text-sm font-bold text-center py-2 ${fl.includes("✓") || fl === "Descartada" || fl === "Pospuesta" ? "text-emerald-600" : "text-red-600"}`}>{fl}</span>
                      ) : (
                        <>
                          {a.canales.includes("WHATSAPP") && a.wa && (
                            <button onClick={() => enviarWhatsApp(a)} disabled={isBusy}
                              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-3 py-2 rounded-xl disabled:opacity-40">
                              <MessageCircle className="h-4 w-4" /> WhatsApp
                            </button>
                          )}
                          {a.canales.includes("EMAIL") && (
                            <button onClick={() => enviarEmail(a)} disabled={isBusy}
                              className="flex items-center justify-center gap-2 bg-[#0f1f3d] hover:bg-[#16294f] text-white text-sm font-bold px-3 py-2 rounded-xl disabled:opacity-40">
                              <Mail className="h-4 w-4" /> {isBusy ? "Enviando…" : "Enviar correo"}
                            </button>
                          )}
                          <div className="flex gap-1.5">
                            <button onClick={() => posponer(a)} disabled={isBusy} title="Posponer 3 días"
                              className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 px-2 py-1.5 rounded-lg disabled:opacity-40">
                              <Clock className="h-3.5 w-3.5" /> Posponer
                            </button>
                            <button onClick={() => descartar(a)} disabled={isBusy} title="Descartar"
                              className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-slate-400 border border-slate-200 hover:bg-red-50 hover:text-red-600 px-2 py-1.5 rounded-lg disabled:opacity-40">
                              <X className="h-3.5 w-3.5" /> Descartar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ───────────── CLIENTES ───────────── */}
      {tab === "clientes" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4"><p className="text-xs text-slate-400">Clientes</p><p className="text-xl font-black text-slate-900">{clientes.length}</p></div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4"><p className="text-xs text-slate-400">Por cobrar</p><p className="text-xl font-black text-red-600">{formatCurrency(totalPorCobrar)}</p></div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4"><p className="text-xs text-slate-400">Dormidos / riesgo</p><p className="text-xl font-black text-amber-600">{clientes.filter(c => c.temperatura === "DORMIDO" || c.temperatura === "RIESGO").length}</p></div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4"><p className="text-xs text-slate-400">Activos</p><p className="text-xl font-black text-emerald-600">{clientes.filter(c => c.temperatura === "ACTIVO").length}</p></div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {([["TODOS", "Todos"], ["PORCOBRAR", "Por cobrar"], ["DORMIDO", "Dormidos / riesgo"], ["ACTIVO", "Activos"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setFiltroCli(k)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border ${filtroCli === k ? "bg-[#0f1f3d] text-white border-[#0f1f3d]" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>{l}</button>
            ))}
            <div className="relative ml-auto">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={buscaCli} onChange={e => setBuscaCli(e.target.value)} placeholder="Buscar cliente…"
                className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl w-full sm:w-56" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {loadingCli ? (
              <div className="p-10 text-center text-slate-400 text-sm">Cargando clientes…</div>
            ) : clientesFiltrados.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">Sin clientes para este filtro.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                      <th className="px-4 py-3 font-semibold">Cliente</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                      <th className="px-4 py-3 font-semibold text-right">Facturado</th>
                      <th className="px-4 py-3 font-semibold text-right">Por cobrar</th>
                      <th className="px-4 py-3 font-semibold text-center">Cotiz.</th>
                      <th className="px-4 py-3 font-semibold">Última compra</th>
                      <th className="px-4 py-3 font-semibold text-right">Contacto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {clientesFiltrados.map(c => (
                      <tr key={c.id} onClick={() => abrirFicha(c.id)} className="hover:bg-slate-50/60 cursor-pointer">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900 leading-tight">{c.razonSocial}</p>
                          <p className="text-xs text-slate-400">{c.sector}{c.ciudad ? ` · ${c.ciudad}` : ""} · {c.totalPedidos} pedido(s)</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${TEMP_COLOR[c.temperatura]}`}>{TEMP_LABEL[c.temperatura]}</span>
                          {c.facturasVencidas > 0 && <span className="ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">{c.facturasVencidas} venc.</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-700">{formatCurrency(c.totalFacturado)}</td>
                        <td className={`px-4 py-3 text-right font-bold ${c.montoPorCobrar > 0 ? "text-red-600" : "text-slate-300"}`}>{c.montoPorCobrar > 0 ? formatCurrency(c.montoPorCobrar) : "—"}</td>
                        <td className="px-4 py-3 text-center">{c.cotizacionesPendientes > 0 ? <span className="text-xs font-bold text-indigo-600">{c.cotizacionesPendientes}</span> : <span className="text-slate-300">—</span>}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {c.ultimaCompra ? <>{formatDate(c.ultimaCompra)}<span className="block text-xs text-slate-400">hace {c.diasSinComprar} día(s)</span></> : <span className="text-slate-300">Nunca</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 justify-end" onClick={e => e.stopPropagation()}>
                            {c.wa && (
                              <a href={`https://wa.me/${c.wa}?text=${encodeURIComponent(`Hola ${c.razonSocial}, le saluda Pekín Global Parts 👋`)}`} target="_blank" rel="noopener noreferrer"
                                className="text-green-600 hover:bg-green-50 rounded-lg p-1.5" title="WhatsApp"><MessageCircle className="h-4 w-4" /></a>
                            )}
                            <a href={`mailto:${c.email}`} className="text-slate-500 hover:bg-slate-100 rounded-lg p-1.5" title={c.email}><Mail className="h-4 w-4" /></a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────── PROSPECTOS ───────────── */}
      {tab === "prospectos" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-slate-500 text-sm">Leads que aún no están en el sistema (WhatsApp, web, referidos). Capta y conviértelos.</p>
            <button onClick={abrirNuevo} className="flex items-center gap-2 bg-[#0f1f3d] hover:bg-[#16294f] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0">
              <Plus className="h-4 w-4" /> Nuevo prospecto
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4"><p className="text-xs text-slate-400">Prospectos activos</p><p className="text-xl font-black text-slate-900">{activos.length}</p></div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4"><p className="text-xs text-slate-400">Valor en pipeline</p><p className="text-xl font-black text-[#0f1f3d]">{formatCurrency(valorPipeline)}</p></div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4"><p className="text-xs text-slate-400">Seguim. pendientes</p><p className="text-xl font-black text-amber-600">{pendientes.length}</p></div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4"><p className="text-xs text-slate-400">Ganados</p><p className="text-xl font-black text-emerald-600">{prospectos.filter(p => p.etapa === "GANADO").length}</p></div>
          </div>

          {/* Pendientes */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-500" />
              <h2 className="font-bold text-slate-900 text-sm">Seguimientos pendientes</h2>
              {pendHoy > 0 && <span className="text-[11px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{pendHoy} para hoy / vencidos</span>}
            </div>
            {loading ? (
              <div className="p-6 text-center text-slate-400 text-sm">Cargando…</div>
            ) : pendientes.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">Sin seguimientos pendientes. Agrega uno desde un prospecto 👇</div>
            ) : (
              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {pendientes.map(({ s, p }) => {
                  const vencido = s.fecha.slice(0, 10) < hoy;
                  const esHoy = s.fecha.slice(0, 10) === hoy;
                  return (
                    <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                      <button onClick={() => marcarSeg(s)} title="Marcar como hecho"
                        className="h-5 w-5 rounded-full border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 shrink-0 flex items-center justify-center">
                        <Check className="h-3 w-3 text-transparent hover:text-emerald-500" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{s.titulo}</p>
                        <p className="text-xs text-slate-400">{p.nombre}{p.empresa ? ` · ${p.empresa}` : ""}</p>
                      </div>
                      <span className={`text-xs font-bold shrink-0 ${vencido ? "text-red-600" : esHoy ? "text-amber-600" : "text-slate-400"}`}>
                        {vencido ? "Vencido" : esHoy ? "Hoy" : formatDate(s.fecha)}
                      </span>
                      {waLink(p.telefono, p.nombre) && (
                        <a href={waLink(p.telefono, p.nombre)!} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 shrink-0" title="WhatsApp">
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Embudo */}
          <div>
            <h2 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#0f1f3d]" /> Embudo de ventas</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {ETAPAS.map(etapa => {
                const items = prospectos.filter(p => p.etapa === etapa);
                return (
                  <div key={etapa} className="shrink-0 w-64 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col max-h-[70vh]">
                    <div className="px-3 py-2.5 border-b border-slate-200 flex items-center justify-between sticky top-0">
                      <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <span className={`h-2.5 w-2.5 rounded-full ${ETAPA_COLOR[etapa]}`} /> {ETAPA_LABEL[etapa]}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{items.length}</span>
                    </div>
                    <div className="p-2 space-y-2 overflow-y-auto">
                      {items.length === 0 ? (
                        <p className="text-[11px] text-slate-300 text-center py-4">—</p>
                      ) : items.map(p => {
                        const prox = p.seguimientos[0];
                        const wa = waLink(p.telefono, p.nombre);
                        return (
                          <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-bold text-slate-900 leading-tight">{p.nombre}</p>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${ORIGEN_COLOR[p.origen] || ORIGEN_COLOR.OTRO}`}>{ORIGEN_LABEL[p.origen] || p.origen}</span>
                            </div>
                            {p.empresa && <p className="text-xs text-slate-400">{p.empresa}</p>}
                            {p.interes && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.interes}</p>}
                            {p.valorEstimado != null && <p className="text-xs font-bold text-emerald-700 mt-1">{formatCurrency(p.valorEstimado)}</p>}
                            {prox && (
                              <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1"><CalendarClock className="h-3 w-3" /> {formatDate(prox.fecha)}: {prox.titulo}</p>
                            )}
                            <div className="mt-2 pt-2 border-t border-slate-50 flex items-center gap-1">
                              {wa && (
                                <a href={wa} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:bg-green-50 rounded-lg p-1.5" title="WhatsApp"><MessageCircle className="h-4 w-4" /></a>
                              )}
                              <button onClick={() => abrirSeg(p)} className="text-amber-600 hover:bg-amber-50 rounded-lg p-1.5" title="Agregar seguimiento"><Bell className="h-4 w-4" /></button>
                              <select value={p.etapa} onChange={e => cambiarEtapa(p, e.target.value)} title="Mover de etapa"
                                className="ml-auto text-[11px] font-semibold border border-slate-200 rounded-lg px-1.5 py-1 bg-white max-w-[92px]">
                                {ETAPAS.map(e => <option key={e} value={e}>{ETAPA_LABEL[e]}</option>)}
                              </select>
                              <button onClick={() => abrirEditar(p)} className="text-slate-400 hover:text-blue-600 p-1" title="Editar"><Pencil className="h-3.5 w-3.5" /></button>
                              <button onClick={() => eliminar(p.id)} className="text-slate-300 hover:text-red-500 p-1" title="Eliminar"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Ficha 360 */}
      {(ficha || loadingFicha) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => { setFicha(null); setLoadingFicha(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-3xl my-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            {loadingFicha || !ficha ? (
              <div className="p-12 text-center text-slate-400 text-sm">Cargando ficha…</div>
            ) : (
              <>
                <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
                  <div>
                    <h2 className="font-black text-slate-900 text-lg leading-tight flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-[#0f1f3d]" /> {ficha.cliente.razonSocial}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {ficha.cliente.sector}{ficha.cliente.ciudad ? ` · ${ficha.cliente.ciudad}` : ""}
                      <span className={`ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full ${TEMP_COLOR[ficha.cliente.temperatura]}`}>{TEMP_LABEL[ficha.cliente.temperatura]}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {ficha.cliente.wa && (
                      <a href={`https://wa.me/${ficha.cliente.wa}?text=${encodeURIComponent(`Hola ${ficha.cliente.razonSocial}, le saluda Pekín Global Parts 👋`)}`} target="_blank" rel="noopener noreferrer"
                        className="text-green-600 hover:bg-green-50 rounded-lg p-2" title="WhatsApp"><MessageCircle className="h-5 w-5" /></a>
                    )}
                    <button onClick={() => { setFicha(null); setLoadingFicha(false); }} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {/* KPIs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3"><p className="text-[11px] text-slate-400">Total facturado</p><p className="text-lg font-black text-slate-900">{formatCurrency(ficha.cliente.totalFacturado)}</p></div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3"><p className="text-[11px] text-slate-400">Ticket promedio</p><p className="text-lg font-black text-slate-900">{ficha.ticketPromedio != null ? formatCurrency(ficha.ticketPromedio) : "—"}</p></div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3"><p className="text-[11px] text-slate-400">Pedidos</p><p className="text-lg font-black text-slate-900">{ficha.cliente.totalPedidos}</p></div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3"><p className="text-[11px] text-slate-400">Por cobrar</p><p className={`text-lg font-black ${ficha.cliente.montoPorCobrar > 0 ? "text-red-600" : "text-slate-300"}`}>{ficha.cliente.montoPorCobrar > 0 ? formatCurrency(ficha.cliente.montoPorCobrar) : "—"}</p></div>
                  </div>

                  {/* Conversión + ritmo + pago */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="border border-slate-200 rounded-xl p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Conversión</p>
                      <p className="text-2xl font-black text-[#0f1f3d]">{ficha.conversion.tasa}%</p>
                      <p className="text-xs text-slate-500">{ficha.conversion.convertidas} de {ficha.conversion.cotizaciones} cotizaciones → pedido</p>
                    </div>
                    <div className="border border-slate-200 rounded-xl p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Ritmo de compra</p>
                      <p className="text-2xl font-black text-[#0f1f3d]">{ficha.frecuenciaDias != null ? `~${ficha.frecuenciaDias}d` : "—"}</p>
                      <p className="text-xs text-slate-500">{ficha.proximaCompra ? `Próxima estimada: ${formatDate(ficha.proximaCompra)}` : "Aún sin patrón"}</p>
                    </div>
                    <div className="border border-slate-200 rounded-xl p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Pago</p>
                      <p className="text-2xl font-black text-[#0f1f3d]">{ficha.facturas.diasPromedioPago != null ? `${ficha.facturas.diasPromedioPago}d` : "—"}</p>
                      <p className="text-xs text-slate-500">prom. en pagar · {ficha.facturas.vencidas > 0 ? <span className="text-red-600 font-bold">{ficha.facturas.vencidas} vencida(s)</span> : "al día"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Top comprados */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5"><Package className="h-4 w-4 text-[#0f1f3d]" /> Lo que más compra</h3>
                      {ficha.topComprados.length === 0 ? <p className="text-xs text-slate-400">Sin compras registradas.</p> : (
                        <div className="space-y-1.5">
                          {ficha.topComprados.map((p, i) => (
                            <div key={i} className="flex items-center justify-between gap-2 text-sm bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5">
                              <span className="text-slate-700 truncate">{p.nombre}</span>
                              <span className="text-slate-400 text-xs shrink-0">{p.cantidad} und · <b className="text-slate-700">{formatCurrency(p.monto)}</b></span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Top cotizados */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-[#0f1f3d]" /> Lo que más cotiza</h3>
                      {ficha.topCotizados.length === 0 ? <p className="text-xs text-slate-400">Sin cotizaciones.</p> : (
                        <div className="space-y-1.5">
                          {ficha.topCotizados.map((p, i) => (
                            <div key={i} className="flex items-center justify-between gap-2 text-sm bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5">
                              <span className="text-slate-700 truncate">{p.nombre}</span>
                              <span className="text-slate-400 text-xs shrink-0">{p.veces}x</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cotizaciones abiertas = plata sobre la mesa */}
                  {ficha.cotizacionesAbiertas.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <h3 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-1.5"><DollarSign className="h-4 w-4" /> Cotizaciones sin cerrar — oportunidad de recuperar</h3>
                      <div className="space-y-1.5">
                        {ficha.cotizacionesAbiertas.slice(0, 5).map((c, i) => (
                          <div key={i} className="flex items-center justify-between gap-2 text-sm">
                            <span className="text-slate-700">{c.numero} <span className="text-slate-400 text-xs">· hace {c.dias}d</span></span>
                            <span className="font-bold text-amber-800">{c.total != null ? formatCurrency(c.total) : "—"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Últimas compras */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5"><CalendarClock className="h-4 w-4 text-[#0f1f3d]" /> Últimas compras</h3>
                    {ficha.compras.length === 0 ? <p className="text-xs text-slate-400">Sin compras.</p> : (
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {ficha.compras.slice(0, 10).map(p => (
                          <div key={p.id} className="border border-slate-100 rounded-lg px-3 py-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold text-slate-800">{p.numero} <span className="text-xs text-slate-400 font-normal">· {formatDate(p.fecha)}</span></span>
                              <span className="text-sm font-bold text-slate-900">{formatCurrency(p.total)}</span>
                            </div>
                            {p.items.length > 0 && <p className="text-xs text-slate-400 mt-0.5 truncate">{p.items.map(it => `${it.nombre} (${it.cantidad})`).join(", ")}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal prospecto */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg my-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-black text-slate-900">{editId ? "Editar prospecto" : "Nuevo prospecto"}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre *</label>
                  <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">WhatsApp / teléfono</label>
                  <input value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} inputMode="tel" placeholder="9XXXXXXXX" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Empresa</label>
                  <input value={form.empresa} onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Origen</label>
                  <select value={form.origen} onChange={e => setForm(f => ({ ...f, origen: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                    {ORIGENES.map(o => <option key={o} value={o}>{ORIGEN_LABEL[o]}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">¿Qué busca? (interés)</label>
                <input value={form.interes} onChange={e => setForm(f => ({ ...f, interes: e.target.value }))} placeholder="Ej: amortiguadores Hilux, cremallera L200…" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Etapa</label>
                  <select value={form.etapa} onChange={e => setForm(f => ({ ...f, etapa: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                    {ETAPAS.map(e => <option key={e} value={e}>{ETAPA_LABEL[e]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor estimado (S/)</label>
                  <input type="number" min={0} step="0.01" value={form.valorEstimado} onChange={e => setForm(f => ({ ...f, valorEstimado: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notas</label>
                <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
                <button onClick={guardar} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[#0f1f3d] hover:bg-[#16294f] text-white text-sm font-bold disabled:opacity-40">
                  {saving ? "Guardando…" : editId ? "Guardar" : "Crear prospecto"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal seguimiento */}
      {segFor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setSegFor(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm my-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-black text-slate-900 flex items-center gap-2"><Bell className="h-5 w-5 text-amber-500" /> Nuevo seguimiento</h2>
              <button onClick={() => setSegFor(null)} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-500">Para <b>{segFor.nombre}</b></p>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">¿Qué hay que hacer?</label>
                <input value={segTitulo} onChange={e => setSegTitulo(e.target.value)} placeholder="Ej: Llamar para cerrar pedido" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">¿Cuándo?</label>
                <input type="date" value={segFecha} onChange={e => setSegFecha(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setSegFor(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
                <button onClick={guardarSeg} disabled={!segTitulo.trim()} className="flex-1 py-2.5 rounded-xl bg-[#0f1f3d] hover:bg-[#16294f] text-white text-sm font-bold disabled:opacity-40">Agregar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
