"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, Eye, Clock, Copy } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  const [motivo, setMotivo] = useState("");
  const [processing, setProcessing] = useState(false);
  const [credenciales, setCredenciales] = useState<{ ruc: string; password: string; empresa: string } | null>(null);

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

  const handleAccion = async (accion: "aprobar" | "rechazar" | "en_revision") => {
    if (!selected) return;
    setProcessing(true);
    const res = await fetch(`/api/admin/solicitudes/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accion,
        motivo: accion === "rechazar" ? motivo : undefined,
        lineaCredito: accion === "aprobar" ? Number(lineaCredito) : undefined,
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

            {selected.status === "PENDIENTE" || selected.status === "EN_REVISION" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Línea de crédito inicial (S/)
                  </label>
                  <input
                    type="number"
                    value={lineaCredito}
                    onChange={(e) => setLineaCredito(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

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
