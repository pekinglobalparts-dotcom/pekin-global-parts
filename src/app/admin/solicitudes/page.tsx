"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, Eye, Clock, Copy, FileText, FileUp, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DocCredito {
  id: string;
  tipo: string;
  nombre: string;
  url: string;
}

interface Solicitud {
  id: string;
  razonSocial: string;
  ruc: string;
  emailCorporativo: string;
  telefono: string;
  sector: string;
  representanteLegal: string;
  cargo: string;
  mensaje?: string;
  status: string;
  createdAt: string;
  tokenDocumentos?: string;
  documentosAt?: string;
  documentos?: DocCredito[];
}

const statusBadge: Record<string, "warning" | "success" | "destructive" | "default"> = {
  PENDIENTE: "warning",
  EN_REVISION: "default",
  APROBADA: "success",
  RECHAZADA: "destructive",
};

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDIENTE");
  const [selected, setSelected] = useState<Solicitud | null>(null);
  const [lineaCredito, setLineaCredito] = useState("10000");
  const [tipoPago, setTipoPago] = useState<"CREDITO" | "CONTADO">("CREDITO");
  const [plazoCredito, setPlazoCredito] = useState("30");
  const [motivo, setMotivo] = useState("");
  const [processing, setProcessing] = useState(false);
  const [credenciales, setCredenciales] = useState<{ ruc: string; password: string; empresa: string } | null>(null);
  const [solicitandoDocs, setSolicitandoDocs] = useState(false);
  const [docLinkCopiado, setDocLinkCopiado] = useState(false);

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/solicitudes?status=${filter}`);
    const data = await res.json();
    setSolicitudes(data.solicitudes || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  const handleSolicitarDocs = async () => {
    if (!selected) return;
    setSolicitandoDocs(true);
    const res = await fetch(`/api/admin/solicitudes/${selected.id}/solicitar-documentos`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setSelected(prev => prev ? { ...prev, status: "EN_REVISION", tokenDocumentos: data.uploadUrl.split("/documentos/")[1] } : null);
      fetchSolicitudes();
    }
    setSolicitandoDocs(false);
  };

  const handleAccion = async (accion: "aprobar" | "rechazar" | "en_revision") => {
    if (!selected) return;
    setProcessing(true);
    const res = await fetch(`/api/admin/solicitudes/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accion,
        motivo: accion === "rechazar" ? motivo : undefined,
        lineaCredito: accion === "aprobar" && tipoPago === "CREDITO" ? Number(lineaCredito) : 0,
        tipoPago: accion === "aprobar" ? tipoPago : undefined,
        plazoCredito: accion === "aprobar" && tipoPago === "CREDITO" ? Number(plazoCredito) : undefined,
      }),
    });
    const data = await res.json();
    if (accion === "aprobar" && res.ok && data.password) {
      setCredenciales({ ruc: selected.ruc, password: data.password, empresa: selected.razonSocial });
    }
    setSelected(null);
    setMotivo("");
    fetchSolicitudes();
    setProcessing(false);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Solicitudes de afiliación</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["PENDIENTE", "EN_REVISION", "APROBADA", "RECHAZADA"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === s
                ? "bg-blue-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Cargando...</div>
        ) : solicitudes.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No hay solicitudes en estado {filter}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Empresa</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Sector</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {solicitudes.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{s.razonSocial}</div>
                    <div className="text-xs text-slate-400">{s.ruc} · {s.emailCorporativo}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{s.sector.replace(/_/g, " ")}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDate(s.createdAt)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={statusBadge[s.status] || "default"}>{s.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelected(s)}
                      className="text-blue-900 hover:text-blue-700 text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Credentials modal */}
      {credenciales && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Check className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Solicitud aprobada</h2>
              <p className="text-slate-500 text-sm mt-1">Comparte estas credenciales con <strong>{credenciales.empresa}</strong> por WhatsApp</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 space-y-4 mb-6">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Usuario (RUC)</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-lg font-bold text-slate-900">{credenciales.ruc}</p>
                  <button onClick={() => navigator.clipboard.writeText(credenciales.ruc)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                    <Copy className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>
              <div className="border-t border-slate-200" />
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Contraseña temporal</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-lg font-bold text-slate-900">{credenciales.password}</p>
                  <button onClick={() => navigator.clipboard.writeText(credenciales.password)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                    <Copy className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>Mensaje sugerido para WhatsApp:</strong><br />
                Hola, su solicitud de afiliación a Pekin Global Parts fue aprobada. Sus credenciales de acceso son:<br />
                Usuario: {credenciales.ruc}<br />
                Contraseña: {credenciales.password}<br />
                Ingrese a: {typeof window !== "undefined" ? window.location.origin : ""}/login y cambie su contraseña desde Mi Perfil.
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(`Hola, su solicitud de afiliación a Pekin Global Parts fue aprobada. Sus credenciales de acceso son:\nUsuario: ${credenciales.ruc}\nContraseña: ${credenciales.password}\nIngrese a: ${typeof window !== "undefined" ? window.location.origin : ""}/login y cambie su contraseña desde Mi Perfil.`)}
                className="mt-3 text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                <Copy className="h-3 w-3" /> Copiar mensaje completo
              </button>
            </div>

            <button
              onClick={() => setCredenciales(null)}
              className="w-full bg-[#0f1f3d] text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-900 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Detalle de solicitud</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {[
                ["Razón social", selected.razonSocial],
                ["RUC", selected.ruc],
                ["Email", selected.emailCorporativo],
                ["Teléfono", selected.telefono],
                ["Sector", selected.sector.replace(/_/g, " ")],
                ["Representante", selected.representanteLegal],
                ["Cargo", selected.cargo],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="text-sm text-slate-500 w-36 shrink-0">{label}</span>
                  <span className="text-sm text-slate-900 font-medium">{value}</span>
                </div>
              ))}
              {selected.mensaje && (
                <div>
                  <span className="text-sm text-slate-500">Mensaje</span>
                  <p className="text-sm text-slate-900 mt-1 bg-slate-50 p-3 rounded-lg">{selected.mensaje}</p>
                </div>
              )}
            </div>

            {/* Documentos subidos */}
            {selected.documentos && selected.documentos.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Documentos recibidos ({selected.documentos.length})
                </p>
                <div className="space-y-1.5">
                  {selected.documentos.map(doc => (
                    <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 hover:bg-blue-100 transition-colors">
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span className="font-semibold">{doc.tipo.replace(/_/g, " ")}</span>
                      <span className="text-blue-400 truncate">{doc.nombre}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Solicitar documentos (antes de aprobar) */}
            {(selected.status === "PENDIENTE" || selected.status === "EN_REVISION") && !selected.tokenDocumentos && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm font-bold text-amber-800 mb-1">¿Necesitas documentos de crédito?</p>
                <p className="text-xs text-amber-700 mb-3">Envía un enlace de carga al solicitante antes de aprobar la línea de crédito.</p>
                <Button variant="outline" className="w-full border-amber-300 text-amber-800 hover:bg-amber-100" loading={solicitandoDocs} onClick={handleSolicitarDocs}>
                  <FileUp className="h-4 w-4" /> Solicitar documentos por email
                </Button>
              </div>
            )}

            {selected.tokenDocumentos && (!selected.documentos || selected.documentos.length === 0) && (
              <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs text-slate-600">
                <span>Enlace de carga enviado — esperando documentos</span>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/documentos/${selected.tokenDocumentos}`;
                    navigator.clipboard.writeText(url);
                    setDocLinkCopiado(true);
                    setTimeout(() => setDocLinkCopiado(false), 2000);
                  }}
                  className="flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900"
                >
                  <Copy className="h-3 w-3" /> {docLinkCopiado ? "Copiado" : "Copiar link"}
                </button>
              </div>
            )}

            {selected.status === "PENDIENTE" || selected.status === "EN_REVISION" ? (
              <div className="space-y-4">
                {/* Tipo de pago */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Modalidad de pago</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTipoPago("CREDITO")}
                      className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${tipoPago === "CREDITO" ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
                    >
                      💳 A crédito
                    </button>
                    <button
                      onClick={() => setTipoPago("CONTADO")}
                      className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${tipoPago === "CONTADO" ? "border-green-600 bg-green-600 text-white" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
                    >
                      💵 Al contado
                    </button>
                  </div>
                </div>

                {/* Campos solo para crédito */}
                {tipoPago === "CREDITO" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Línea de crédito (S/)</label>
                      <input
                        type="number"
                        value={lineaCredito}
                        onChange={(e) => setLineaCredito(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Plazo de pago</label>
                      <select
                        value={plazoCredito}
                        onChange={(e) => setPlazoCredito(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="15">15 días</option>
                        <option value="30">30 días</option>
                        <option value="45">45 días</option>
                        <option value="60">60 días</option>
                      </select>
                    </div>
                  </div>
                )}

                {tipoPago === "CONTADO" && (
                  <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
                    El cliente pagará por transferencia o link de pago antes de cada despacho. No se asigna línea de crédito.
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="success"
                    className="flex-1"
                    loading={processing}
                    onClick={() => handleAccion("aprobar")}
                  >
                    <Check className="h-4 w-4" /> Aprobar
                  </Button>
                  <div className="flex-1">
                    <input
                      placeholder="Motivo del rechazo..."
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-2"
                    />
                    <Button
                      variant="destructive"
                      className="w-full"
                      loading={processing}
                      onClick={() => handleAccion("rechazar")}
                    >
                      <X className="h-4 w-4" /> Rechazar
                    </Button>
                  </div>
                </div>

                {selected.status === "PENDIENTE" && (
                  <Button
                    variant="outline"
                    className="w-full"
                    loading={processing}
                    onClick={() => handleAccion("en_revision")}
                  >
                    <Clock className="h-4 w-4" /> Marcar en revisión
                  </Button>
                )}
              </div>
            ) : (
              <Badge variant={statusBadge[selected.status] || "default"}>
                {selected.status}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
