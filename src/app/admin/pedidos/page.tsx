"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ChevronDown, ChevronUp, Truck, Package, Check, Plus, X, Trash2, FileText, Download } from "lucide-react";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PedidoItem {
  id: string;
  cantidad: number;
  precioUnit: number;
  costoUnit?: number | null;
  subtotal: number;
  descripcion?: string | null;
  producto?: { nombre: string; codigo: string } | null;
}

interface Pedido {
  id: string;
  numero: string;
  status: string;
  total: number;
  subtotal: number;
  igv: number;
  notas: string | null;
  ocUrl?: string | null;
  ocNumero?: string | null;
  createdAt: string;
  socio: { razonSocial: string; ruc: string; emailCorporativo: string };
  items: PedidoItem[];
}

interface SocioOpcion {
  id: string;
  razonSocial: string;
  ruc: string;
}

interface LineaItem {
  descripcion: string;
  cantidad: number;
  precioUnit: number;
  costoUnit: number;
}

const STATUSES = ["PENDIENTE", "CONFIRMADO", "EN_PROCESO", "ENVIADO", "ENTREGADO", "CANCELADO"];
const FILTERS = ["TODOS", "PENDIENTE", "CONFIRMADO", "EN_PROCESO", "ENVIADO", "ENTREGADO"];

const statusVariant: Record<string, "warning" | "default" | "success" | "destructive" | "secondary"> = {
  PENDIENTE: "warning",
  CONFIRMADO: "default",
  EN_PROCESO: "default",
  ENVIADO: "success",
  ENTREGADO: "success",
  CANCELADO: "destructive",
};

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("TODOS");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [esSuperAdmin, setEsSuperAdmin] = useState(false);

  // --- Orden de compra (por pedido) ---
  const [uploadingOc, setUploadingOc] = useState<string | null>(null);
  const [ocNumeroInput, setOcNumeroInput] = useState<Record<string, string>>({});
  const [ocError, setOcError] = useState<Record<string, string>>({});

  // --- Costos por línea (para calcular ganancia) ---
  const [costoInput, setCostoInput] = useState<Record<string, string>>({});
  const [savingCostos, setSavingCostos] = useState<string | null>(null);
  const [costosOk, setCostosOk] = useState<string | null>(null);

  // --- Modal "Crear pedido manual" ---
  const [modalOpen, setModalOpen] = useState(false);
  const [socios, setSocios] = useState<SocioOpcion[]>([]);
  const [socioId, setSocioId] = useState("");
  const [items, setItems] = useState<LineaItem[]>([{ descripcion: "", cantidad: 1, precioUnit: 0, costoUnit: 0 }]);
  const [modalidad, setModalidad] = useState<"CREDITO" | "CONTADO">("CREDITO");
  const [plazoDias, setPlazoDias] = useState(30);
  const [notas, setNotas] = useState("");
  const [direccion, setDireccion] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [success, setSuccess] = useState(false);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const params = filter !== "TODOS" ? `?status=${filter}` : "";
    const res = await fetch(`/api/admin/pedidos${params}`);
    const data = await res.json();
    setPedidos(data.pedidos || []);
    setEsSuperAdmin(!!data.esSuperAdmin);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch(`/api/admin/pedidos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setPedidos(prev =>
      prev.map(p => p.id === id ? { ...p, status } : p)
    );
    setUpdating(null);
  };

  const nextStatus = (current: string): string | null => {
    const idx = STATUSES.indexOf(current);
    if (idx < 0 || idx >= STATUSES.length - 2) return null;
    return STATUSES[idx + 1];
  };

  // Guarda el enlace de la O.C. (y su número) en el pedido
  const saveOc = async (id: string, ocUrl: string | null, ocNumero?: string) => {
    const res = await fetch(`/api/admin/pedidos/${id}/oc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ocUrl, ocNumero: ocNumero ?? null }),
    });
    if (res.ok) {
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, ocUrl, ocNumero: ocNumero ?? p.ocNumero } : p));
    }
    return res.ok;
  };

  const saveOcNumero = async (id: string) => {
    const num = ocNumeroInput[id];
    if (num === undefined) return;
    const pedido = pedidos.find(p => p.id === id);
    await saveOc(id, pedido?.ocUrl ?? null, num);
  };

  // Guarda el costo de cada línea del pedido (para calcular ganancia)
  const costoValor = (item: PedidoItem): number => {
    const raw = costoInput[item.id];
    if (raw !== undefined) return parseFloat(raw) || 0;
    return item.costoUnit != null ? Number(item.costoUnit) : 0;
  };

  const saveCostos = async (pedido: Pedido) => {
    setSavingCostos(pedido.id);
    setCostosOk(null);
    const costos = pedido.items.map(it => ({
      itemId: it.id,
      costoUnit: costoValor(it) > 0 ? costoValor(it) : null,
    }));
    const res = await fetch(`/api/admin/pedidos/${pedido.id}/costos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ costos }),
    });
    if (res.ok) {
      setPedidos(prev => prev.map(p => p.id === pedido.id
        ? { ...p, items: p.items.map(it => ({ ...it, costoUnit: costoValor(it) > 0 ? costoValor(it) : null })) }
        : p));
      setCostosOk(pedido.id);
    }
    setSavingCostos(null);
  };

  // --- Lógica del modal ---
  const openModal = async () => {
    setSocioId("");
    setItems([{ descripcion: "", cantidad: 1, precioUnit: 0, costoUnit: 0 }]);
    setModalidad("CREDITO");
    setPlazoDias(30);
    setNotas("");
    setDireccion("");
    setCreateError("");
    setSuccess(false);
    setModalOpen(true);
    if (socios.length === 0) {
      try {
        const res = await fetch("/api/admin/socios?limit=200");
        const data = await res.json();
        setSocios(
          (data.socios || []).map((s: SocioOpcion) => ({ id: s.id, razonSocial: s.razonSocial, ruc: s.ruc }))
        );
      } catch {
        /* se muestra selector vacío; el admin verá el error al enviar */
      }
    }
  };

  const addItem = () => setItems(p => [...p, { descripcion: "", cantidad: 1, precioUnit: 0, costoUnit: 0 }]);
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof LineaItem, val: string | number) =>
    setItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const totalModal = items.reduce((s, i) => s + i.precioUnit * i.cantidad, 0);
  const modalValido =
    socioId !== "" && items.every(i => i.descripcion.trim() !== "" && i.cantidad >= 1 && i.precioUnit >= 0);

  const handleCrear = async () => {
    if (!modalValido) return;
    setCreating(true);
    setCreateError("");
    const modalidadTexto =
      modalidad === "CONTADO" ? "Modalidad de pago: Contado" : `Modalidad de pago: Crédito a ${plazoDias} días`;
    const notasFinal = [modalidadTexto, notas.trim()].filter(Boolean).join("\n");
    try {
      const res = await fetch("/api/admin/pedidos/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ socioId, items, notas: notasFinal, direccionEntrega: direccion }),
      });
      if (res.ok) {
        setSuccess(true);
        fetch_();
      } else {
        const data = await res.json().catch(() => ({}));
        setCreateError(data.error || "No se pudo crear el pedido. Intenta de nuevo.");
      }
    } catch {
      setCreateError("Error de conexión. Intenta de nuevo.");
    }
    setCreating(false);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Pedidos</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Gestione el flujo de pedidos de sus socios
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-[#0f1f3d] hover:bg-[#16294f] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" /> Crear pedido manual
        </button>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === f
                ? "bg-[#0f1f3d] text-white"
                : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Cargando...</div>
        ) : pedidos.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No hay pedidos en este estado</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {pedidos.map(pedido => {
              const next = nextStatus(pedido.status);
              return (
                <div key={pedido.id}>
                  <div
                    className="flex flex-wrap sm:flex-nowrap items-center gap-x-4 gap-y-2 p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === pedido.id ? null : pedido.id)}
                  >
                    <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                      <ShoppingCart className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{pedido.numero}</span>
                        <Badge variant={statusVariant[pedido.status] || "default"}>
                          {pedido.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {pedido.socio.razonSocial} · {pedido.items.length} productos · {formatDate(pedido.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
                      <span className="font-bold text-blue-900 text-sm">{formatCurrency(pedido.total)}</span>

                      {next && (
                        <Button
                          size="sm"
                          variant="outline"
                          loading={updating === pedido.id}
                          onClick={e => { e.stopPropagation(); updateStatus(pedido.id, next); }}
                          className="shrink-0"
                        >
                          {next === "ENVIADO" ? <Truck className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                          {next.replace(/_/g, " ")}
                        </Button>
                      )}

                      {expanded === pedido.id
                        ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                        : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expanded === pedido.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-50"
                      >
                        <div className="p-4 bg-slate-50 space-y-2">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                            {pedido.socio.razonSocial} · {pedido.socio.emailCorporativo}
                          </p>
                          {pedido.items.map(item => (
                            <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-3">
                              <Package className="h-4 w-4 text-slate-400 shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900">
                                  {item.producto?.nombre ?? item.descripcion ?? "Ítem"}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {item.producto ? `${item.producto.codigo} · ` : "Repuesto manual · "}x{item.cantidad}
                                </p>
                              </div>
                              <p className="text-sm font-bold text-slate-700">{formatCurrency(item.subtotal)}</p>
                            </div>
                          ))}
                          <div className="bg-white rounded-lg px-4 py-3 flex justify-between text-sm">
                            <span className="text-slate-500">Subtotal + IGV</span>
                            <div className="text-right">
                              <span className="font-bold text-slate-900">{formatCurrency(pedido.total)}</span>
                              <span className="text-slate-400 text-xs block">(IGV: {formatCurrency(pedido.igv)})</span>
                            </div>
                          </div>

                          {/* Costo y ganancia — solo Super Admin (el socio y otros admin nunca lo ven) */}
                          {esSuperAdmin && (() => {
                            const ventaReal = Number(pedido.total);
                            const costoTotal = pedido.items.reduce((s, it) => s + costoValor(it) * it.cantidad, 0);
                            const ganancia = ventaReal - costoTotal;
                            const hayCosto = pedido.items.some(it => costoValor(it) > 0);
                            return (
                              <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg px-4 py-3">
                                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">
                                  Costo y ganancia · privado
                                </p>
                                <div className="space-y-2">
                                  {pedido.items.map(it => (
                                    <div key={it.id} className="flex items-center gap-2">
                                      <span className="flex-1 text-xs text-slate-600 truncate">
                                        {it.producto?.nombre ?? it.descripcion ?? "Ítem"} <span className="text-slate-400">×{it.cantidad}</span>
                                      </span>
                                      <div className="relative w-32 shrink-0">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">S/</span>
                                        <input
                                          type="number" min={0} step="0.01"
                                          value={costoInput[it.id] ?? (it.costoUnit != null ? String(Number(it.costoUnit)) : "")}
                                          onChange={e => { setCostoInput(prev => ({ ...prev, [it.id]: e.target.value })); setCostosOk(null); }}
                                          placeholder="Costo unit."
                                          className="w-full border border-emerald-200 rounded-lg pl-6 pr-2 py-1.5 text-xs"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-emerald-100">
                                  <div className="text-xs text-slate-500">
                                    Venta: <b className="text-slate-700">{formatCurrency(ventaReal)}</b>
                                    {hayCosto && <> · Costo: <b className="text-slate-700">{formatCurrency(costoTotal)}</b></>}
                                    {hayCosto && <> · Ganancia: <b className="text-emerald-700">{formatCurrency(ganancia)}</b></>}
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {costosOk === pedido.id && <span className="text-xs text-emerald-600 font-semibold">Guardado ✓</span>}
                                    <Button size="sm" variant="outline" loading={savingCostos === pedido.id}
                                      onClick={() => saveCostos(pedido)}>
                                      Guardar costo
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-2">Pon el <b>total que pagaste</b> a tu proveedor por cada repuesto, <b>con IGV incluido</b> (igual que el precio de venta, para que la ganancia sea real). Solo lo ves tú.</p>
                              </div>
                            );
                          })()}

                          {pedido.notas && (
                            <div className="bg-white rounded-lg px-4 py-3">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notas</p>
                              <p className="text-sm text-slate-700 whitespace-pre-wrap">{pedido.notas}</p>
                            </div>
                          )}

                          {/* Orden de compra (O.C.) del cliente */}
                          <div className="bg-white rounded-lg px-4 py-3">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5" /> Orden de compra (O.C.) del cliente
                            </p>

                            <div className="flex gap-2 mb-2">
                              <input
                                type="text"
                                placeholder={pedido.ocNumero || "N° de O.C. (ej: 0000012791)"}
                                defaultValue={pedido.ocNumero || ""}
                                onChange={e => setOcNumeroInput(prev => ({ ...prev, [pedido.id]: e.target.value }))}
                                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                              />
                              <Button size="sm" variant="outline" onClick={() => saveOcNumero(pedido.id)}>
                                Guardar N°
                              </Button>
                            </div>

                            {pedido.ocUrl ? (
                              <div className="flex items-center gap-2 flex-wrap">
                                <a href={pedido.ocUrl} target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" variant="outline" className="text-green-700 border-green-200 hover:bg-green-50">
                                    <Download className="h-3.5 w-3.5" /> Ver / descargar O.C.
                                  </Button>
                                </a>
                                <button
                                  onClick={() => saveOc(pedido.id, null)}
                                  className="text-xs text-slate-400 hover:text-red-500 font-medium"
                                >
                                  Quitar
                                </button>
                                <span className="text-xs text-green-600 font-semibold">O.C. adjunta ✓</span>
                              </div>
                            ) : (
                              <>
                                <UploadDropzone<OurFileRouter, "ordenCompra">
                                  endpoint="ordenCompra"
                                  onUploadBegin={() => { setOcError(prev => ({ ...prev, [pedido.id]: "" })); setUploadingOc(pedido.id); }}
                                  onClientUploadComplete={async (files) => {
                                    const url = files?.[0]?.ufsUrl ?? files?.[0]?.url;
                                    if (url) await saveOc(pedido.id, url, ocNumeroInput[pedido.id]);
                                    setUploadingOc(null);
                                  }}
                                  onUploadError={(err) => {
                                    setUploadingOc(null);
                                    setOcError(prev => ({ ...prev, [pedido.id]: err?.message || "No se pudo subir el archivo." }));
                                  }}
                                  appearance={{
                                    container: "border-2 border-dashed border-slate-200 rounded-xl p-3 cursor-pointer hover:border-[#0f1f3d] transition-colors ut-uploading:opacity-70",
                                    uploadIcon: "hidden",
                                    label: "text-xs text-slate-500",
                                    allowedContent: "text-[11px] text-slate-400",
                                    button: "bg-[#0f1f3d] text-white text-xs font-bold px-3 py-1.5 rounded-lg ut-ready:bg-[#0f1f3d] after:bg-blue-400",
                                  }}
                                  content={{
                                    label: uploadingOc === pedido.id ? "Subiendo…" : "Arrastra el PDF de la O.C. o haz clic",
                                    button: ({ isUploading }) => (isUploading ? "Subiendo…" : "Subir O.C."),
                                  }}
                                />
                                {ocError[pedido.id] && (
                                  <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-2">
                                    Error al subir: {ocError[pedido.id]}
                                  </p>
                                )}
                              </>
                            )}
                            <p className="text-[11px] text-slate-400 mt-2">Recibes la O.C. por WhatsApp y la adjuntas aquí. Queda guardada en la nube y el socio también podrá descargarla.</p>
                          </div>

                          {/* Status flow */}
                          <div className="bg-white rounded-lg px-4 py-3">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Cambiar estado</p>
                            <div className="flex gap-2 flex-wrap">
                              {STATUSES.filter(s => s !== "CANCELADO").map(s => (
                                <button
                                  key={s}
                                  disabled={s === pedido.status || updating === pedido.id}
                                  onClick={() => updateStatus(pedido.id, s)}
                                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                                    s === pedido.status
                                      ? "bg-blue-900 text-white"
                                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                  }`}
                                >
                                  {s.replace(/_/g, " ")}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: crear pedido manual */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">¡Pedido creado!</h3>
                  <p className="text-slate-500 text-sm mb-6">
                    El socio recibirá una notificación y verá el pedido en su portal con el estado en tiempo real.
                  </p>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="bg-[#0f1f3d] text-white px-6 py-2.5 rounded-xl font-bold text-sm"
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">Crear pedido manual</h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Para repuestos cotizados que no están en el catálogo. El IGV se calcula automáticamente.
                      </p>
                    </div>
                    <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Socio */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Socio</label>
                    <select
                      value={socioId}
                      onChange={e => setSocioId(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white"
                    >
                      <option value="">— Selecciona un socio —</option>
                      {socios.map(s => (
                        <option key={s.id} value={s.id}>{s.razonSocial} · RUC {s.ruc}</option>
                      ))}
                    </select>
                  </div>

                  {/* Items */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Líneas del pedido</label>
                      <button onClick={addItem} className="flex items-center gap-1 text-xs text-blue-700 font-semibold hover:underline">
                        <Plus className="h-3.5 w-3.5" /> Agregar línea
                      </button>
                    </div>
                    <div className="space-y-2">
                      {items.map((item, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 items-center border border-slate-100 rounded-xl p-2">
                          <div className="col-span-12">
                            <input
                              value={item.descripcion}
                              onChange={e => updateItem(i, "descripcion", e.target.value)}
                              placeholder="Ej: Faro posterior derecho Toyota Hilux 1GD — Cód. 212-19AMR-AE"
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="col-span-3">
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Cant.</label>
                            <input
                              type="number" min={1} value={item.cantidad}
                              onChange={e => updateItem(i, "cantidad", parseInt(e.target.value) || 1)}
                              className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm text-center"
                            />
                          </div>
                          <div className="col-span-4">
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Precio venta (con IGV)</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">S/</span>
                              <input
                                type="number" min={0} step="0.01" value={item.precioUnit}
                                onChange={e => updateItem(i, "precioUnit", parseFloat(e.target.value) || 0)}
                                placeholder="Precio"
                                className="w-full border border-slate-300 rounded-lg pl-7 pr-2 py-2 text-sm"
                              />
                            </div>
                          </div>
                          <div className="col-span-4">
                            <label className="block text-[10px] font-semibold text-emerald-600 uppercase mb-0.5">Costo (con IGV)</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">S/</span>
                              <input
                                type="number" min={0} step="0.01" value={item.costoUnit}
                                onChange={e => updateItem(i, "costoUnit", parseFloat(e.target.value) || 0)}
                                placeholder="Costo"
                                className="w-full border border-emerald-200 bg-emerald-50/40 rounded-lg pl-7 pr-2 py-2 text-sm"
                              />
                            </div>
                          </div>
                          <div className="col-span-1 flex items-end justify-center pb-1.5">
                            {items.length > 1 && (
                              <button onClick={() => removeItem(i)} className="text-slate-300 hover:text-red-500 transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">Importante: <b>ambos montos van CON IGV</b>. El <b>precio de venta</b> es lo que le cobras al socio (con IGV). El <b className="text-emerald-600">costo</b> es el total que TÚ pagaste al proveedor (el de su factura, que ya incluye IGV) — opcional, solo para tu ganancia; el socio nunca lo ve. Ganancia = venta − costo.</p>
                  </div>

                  {/* Modalidad de pago */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Modalidad de pago</label>
                      <select
                        value={modalidad}
                        onChange={e => setModalidad(e.target.value as "CREDITO" | "CONTADO")}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white"
                      >
                        <option value="CREDITO">Crédito</option>
                        <option value="CONTADO">Contado</option>
                      </select>
                    </div>
                    {modalidad === "CREDITO" && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Plazo (días)</label>
                        <input
                          type="number" min={1} value={plazoDias}
                          onChange={e => setPlazoDias(parseInt(e.target.value) || 1)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Dirección + notas */}
                  <div className="grid grid-cols-1 gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Dirección de entrega (opcional)</label>
                      <input
                        value={direccion}
                        onChange={e => setDireccion(e.target.value)}
                        placeholder="Dirección de despacho"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Notas (opcional)</label>
                      <textarea
                        value={notas}
                        onChange={e => setNotas(e.target.value)}
                        rows={2}
                        placeholder="Ej: O.C. N° 000123 recibida por WhatsApp el 10/08"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-slate-50 rounded-xl px-4 py-3 flex justify-between items-center mb-4">
                    <span className="text-sm font-semibold text-slate-500">Total (IGV incluido)</span>
                    <span className="text-lg font-black text-[#0f1f3d]">{formatCurrency(totalModal)}</span>
                  </div>

                  {createError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">{createError}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCrear}
                      disabled={!modalValido || creating}
                      className="flex-1 py-2.5 rounded-xl bg-[#0f1f3d] hover:bg-[#16294f] text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {creating ? "Creando…" : "Crear pedido"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
