"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";
import { CheckCircle, FileText, Upload, AlertCircle } from "lucide-react";

const DOCS_REQUIRED = [
  { tipo: "DNI_REP_LEGAL",        label: "DNI del representante legal",         hint: "Ambas caras en un solo archivo (PDF o imagen)" },
  { tipo: "FICHA_RUC",            label: "Ficha RUC actualizada",               hint: "Descargada de SUNAT (PDF)" },
  { tipo: "ESTADOS_FINANCIEROS",  label: "Estados financieros o renta anual",   hint: "Último año fiscal (PDF)" },
  { tipo: "REFERENCIAS",          label: "Referencias comerciales",             hint: "Opcional — carta o documento de referencia" },
];

interface DocInfo {
  id: string;
  tipo: string;
  nombre: string;
  url: string;
}

interface SolicitudInfo {
  razonSocial: string;
  ruc: string;
  status: string;
  documentos: DocInfo[];
}

export default function DocumentosPage() {
  const { token } = useParams<{ token: string }>();
  const [info, setInfo] = useState<SolicitudInfo | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/documentos/${token}`);
    if (!res.ok) { setError("Enlace inválido o expirado."); return; }
    const data = await res.json();
    setInfo(data);
    if (data.documentos.length >= DOCS_REQUIRED.filter(d => d.tipo !== "REFERENCIAS").length) {
      setDone(true);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const registerDoc = async (tipo: string, nombre: string, url: string) => {
    await fetch(`/api/documentos/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, nombre, url }),
    });
    load();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm border border-slate-200">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-900 mb-2">Enlace no válido</h2>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Cargando...</p>
      </div>
    );
  }

  const uploadedTipos = new Set(info.documentos.map(d => d.tipo));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#0f1f3d] py-6 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="bg-[#e8121a] w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-sm">PK</div>
          <div>
            <p className="text-white font-black text-sm">PEKIN GLOBAL PARTS</p>
            <p className="text-blue-300 text-xs">Evaluación de línea de crédito</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Empresa info */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Empresa</p>
          <p className="font-black text-slate-900 text-lg">{info.razonSocial}</p>
          <p className="text-slate-500 text-sm">RUC: {info.ruc}</p>
        </div>

        {done ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-black text-slate-900 mb-2">¡Documentos enviados!</h2>
            <p className="text-slate-500 text-sm">Revisaremos su información y le contactaremos en las próximas 24–48 horas hábiles.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-black text-slate-900 mb-1">Sube tus documentos</h1>
              <p className="text-slate-500 text-sm">Necesitamos los siguientes documentos para evaluar tu línea de crédito. Puedes subir PDF o imágenes.</p>
            </div>

            <div className="space-y-4">
              {DOCS_REQUIRED.map(doc => {
                const uploaded = uploadedTipos.has(doc.tipo);
                const isUploading = uploading === doc.tipo;

                return (
                  <div key={doc.tipo} className={`bg-white rounded-2xl border p-5 transition-all ${uploaded ? "border-green-300 bg-green-50" : "border-slate-200"}`}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        {uploaded
                          ? <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                          : <FileText className="h-5 w-5 text-slate-400 shrink-0" />
                        }
                        <div>
                          <p className={`font-bold text-sm ${uploaded ? "text-green-700" : "text-slate-900"}`}>
                            {doc.label}
                            {doc.tipo === "REFERENCIAS" && <span className="ml-2 text-xs font-normal text-slate-400">(Opcional)</span>}
                          </p>
                          <p className="text-xs text-slate-400">{doc.hint}</p>
                        </div>
                      </div>
                      {uploaded && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Subido</span>}
                    </div>

                    {!uploaded && (
                      <UploadDropzone<OurFileRouter, "documentoCredito">
                        endpoint="documentoCredito"
                        onUploadBegin={() => setUploading(doc.tipo)}
                        onClientUploadComplete={async (files) => {
                          if (files[0]) {
                            await registerDoc(doc.tipo, files[0].name, files[0].ufsUrl ?? files[0].url);
                          }
                          setUploading(null);
                        }}
                        onUploadError={() => setUploading(null)}
                        appearance={{
                          container: "border-2 border-dashed border-slate-200 rounded-xl p-4 cursor-pointer hover:border-[#0f1f3d] transition-colors",
                          uploadIcon: "hidden",
                          label: "text-sm text-slate-500",
                          allowedContent: "text-xs text-slate-400",
                          button: `bg-[#0f1f3d] text-white text-xs font-bold px-4 py-2 rounded-lg ${isUploading ? "opacity-60" : ""}`,
                        }}
                        content={{
                          label: isUploading ? "Subiendo..." : "Arrastra tu archivo aquí o haz clic",
                          button: ({ isUploading: ut }) => ut ? "Subiendo..." : "Seleccionar archivo",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <Upload className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-blue-800 text-xs leading-relaxed">
                Sus documentos se transmiten de forma segura y solo serán utilizados para evaluar su línea de crédito. Máximo 8 MB por archivo.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
