"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Building2, Phone, MapPin, Lock, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface Socio {
  id: string;
  razonSocial: string;
  ruc: string;
  emailCorporativo: string;
  telefono: string;
  sector: string;
  representanteLegal: string;
  cargo: string;
  direccion: string | null;
  ciudad: string | null;
  logoUrl: string | null;
  status: string;
  createdAt: string;
}

export default function PerfilPage() {
  const [socio, setSocio] = useState<Socio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  useEffect(() => {
    fetch("/api/socio/perfil")
      .then(r => r.json())
      .then(d => {
        if (d.socio) {
          setSocio(d.socio);
          setTelefono(d.socio.telefono || "");
          setDireccion(d.socio.direccion || "");
          setCiudad(d.socio.ciudad || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/socio/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefono, direccion, ciudad }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordChange = async () => {
    setPwError("");
    if (newPassword !== confirmPassword) {
      setPwError("Las contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    setPwSaving(true);
    const res = await fetch("/api/socio/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPwError(data.error || "Error al cambiar contraseña");
    } else {
      setPwSaved(true);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setTimeout(() => setPwSaved(false), 3000);
    }
    setPwSaving(false);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!socio) return null;

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Mi perfil</h1>
        <p className="text-slate-500 text-sm mt-0.5">Información de su cuenta y empresa</p>
      </div>

      {/* Company info (read-only) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 p-6 mb-4"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-[#0f1f3d] rounded-xl flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">{socio.razonSocial}</h2>
            <p className="text-xs text-slate-400">RUC: {socio.ruc} · Socio desde {formatDate(socio.createdAt)}</p>
          </div>
          <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${
            socio.status === "ACTIVO" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          }`}>
            {socio.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: "Representante legal", value: socio.representanteLegal },
            { label: "Cargo", value: socio.cargo },
            { label: "Email corporativo", value: socio.emailCorporativo },
            { label: "Sector", value: socio.sector.replace(/_/g, " ") },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-slate-400 mb-0.5">{label}</p>
              <p className="font-medium text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Editable contact info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl border border-slate-200 p-6 mb-4"
      >
        <div className="flex items-center gap-2 mb-5">
          <Phone className="h-4 w-4 text-slate-400" />
          <h3 className="font-bold text-slate-900">Contacto y dirección</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono</label>
            <input
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder="+51 999 999 999"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Dirección</label>
            <input
              value={direccion}
              onChange={e => setDireccion(e.target.value)}
              placeholder="Av. Principal 123, Piso 4"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Ciudad</label>
            <input
              value={ciudad}
              onChange={e => setCiudad(e.target.value)}
              placeholder="Lima"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
        </div>

        <div className="mt-5">
          <Button loading={saving} onClick={handleSave}>
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? "Guardado" : "Guardar cambios"}
          </Button>
        </div>
      </motion.div>

      {/* Password change */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200 p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Lock className="h-4 w-4 text-slate-400" />
          <h3 className="font-bold text-slate-900">Cambiar contraseña</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar nueva contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
          {pwError && <p className="text-red-600 text-sm">{pwError}</p>}
        </div>

        <div className="mt-5">
          <Button
            variant="outline"
            loading={pwSaving}
            disabled={!currentPassword || !newPassword || !confirmPassword}
            onClick={handlePasswordChange}
          >
            {pwSaved ? <Check className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            {pwSaved ? "Contraseña actualizada" : "Cambiar contraseña"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
