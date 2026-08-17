"use client";

import { useState, useEffect } from "react";
import { UserCog, Plus, X, Check, Shield, ShieldAlert, Power, Key, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Admin {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
  activo: boolean;
  createdAt: string;
}

export default function AdministradoresPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", password: "", role: "ADMIN" as "SUPER_ADMIN" | "ADMIN",
  });

  useEffect(() => {
    fetch("/api/admin/administradores")
      .then(r => r.json())
      .then(d => {
        setAdmins(d.admins || []);
        setCurrentId(d.currentId || null);
        setIsSuperAdmin(d.isSuperAdmin || false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!isSuperAdmin) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ShieldAlert className="h-16 w-16 text-slate-200 mb-4" />
        <h2 className="text-xl font-black text-slate-900 mb-2">Acceso restringido</h2>
        <p className="text-slate-500 text-sm">Solo el SUPER_ADMIN puede gestionar usuarios administradores.</p>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!form.nombre || !form.apellido || !form.email || !form.password) return;
    setSaving(true);
    const res = await fetch("/api/admin/administradores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setAdmins(prev => [...prev, data]);
      setForm({ nombre: "", apellido: "", email: "", password: "", role: "ADMIN" });
      setShowForm(false);
    }
    setSaving(false);
  };

  const toggleActivo = async (id: string, activo: boolean) => {
    const res = await fetch(`/api/admin/administradores/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !activo }),
    });
    if (res.ok) setAdmins(prev => prev.map(a => a.id === id ? { ...a, activo: !activo } : a));
  };

  const changeRole = async (id: string, role: "SUPER_ADMIN" | "ADMIN") => {
    const res = await fetch(`/api/admin/administradores/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) setAdmins(prev => prev.map(a => a.id === id ? { ...a, role } : a));
  };

  const handleResetPassword = async (id: string) => {
    if (!newPassword || newPassword.length < 8) return;
    setSaving(true);
    await fetch(`/api/admin/administradores/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    setResetPasswordId(null);
    setNewPassword("");
    setSaving(false);
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar al administrador ${nombre}? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/admin/administradores/${id}`, { method: "DELETE" });
    if (res.ok) setAdmins(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Administradores</h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona los usuarios con acceso al panel.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          Nuevo administrador
        </button>
      </div>

      {/* Permissions info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <span className="font-bold text-amber-800 text-sm">SUPER_ADMIN</span>
          </div>
          <ul className="text-xs text-amber-700 space-y-1">
            <li>✓ Todo lo de ADMIN</li>
            <li>✓ Crear/gestionar administradores</li>
            <li>✓ Editar líneas de crédito</li>
            <li>✓ Editar precios y productos del catálogo</li>
            <li>✓ Registrar/ver costos y ganancias (Finanzas)</li>
            <li>✓ Cambiar modalidad de pago</li>
            <li>✓ Eliminar socios, facturas y productos</li>
            <li>✓ Gestión y limpieza de datos</li>
          </ul>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-blue-800 text-sm">ADMIN</span>
          </div>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>✓ Ver y aprobar solicitudes</li>
            <li>✓ Gestionar pedidos y cotizaciones</li>
            <li>✓ Emitir y ver facturas</li>
            <li>✓ Ver productos y socios (solo lectura)</li>
            <li>✗ No puede editar precios ni el catálogo</li>
            <li>✗ No ve costos ni ganancias</li>
            <li>✗ No puede editar crédito</li>
            <li>✗ No puede eliminar registros</li>
          </ul>
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Cargando...</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {admins.map(admin => (
              <div key={admin.id} className="px-3 sm:px-6 py-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${admin.role === "SUPER_ADMIN" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                  {admin.nombre[0]}{admin.apellido[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 text-sm">{admin.nombre} {admin.apellido}</p>
                    {admin.id === currentId && (
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">Tú</span>
                    )}
                    {!admin.activo && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Inactivo</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{admin.email} · Desde {formatDate(admin.createdAt)}</p>
                </div>

                {/* Role toggle */}
                {admin.id !== currentId && (
                  <select
                    value={admin.role}
                    onChange={e => changeRole(admin.id, e.target.value as "SUPER_ADMIN" | "ADMIN")}
                    className={`text-xs font-bold border rounded-lg px-2 py-1.5 focus:outline-none ${admin.role === "SUPER_ADMIN" ? "border-amber-300 text-amber-700 bg-amber-50" : "border-blue-200 text-blue-700 bg-blue-50"}`}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                )}

                {/* Actions */}
                {admin.id !== currentId && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { setResetPasswordId(admin.id); setNewPassword(""); }}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                      title="Cambiar contraseña"
                    >
                      <Key className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => toggleActivo(admin.id, admin.activo)}
                      className={`p-2 rounded-lg transition-colors ${admin.activo ? "hover:bg-amber-50 text-slate-400 hover:text-amber-600" : "hover:bg-green-50 text-slate-400 hover:text-green-600"}`}
                      title={admin.activo ? "Desactivar" : "Activar"}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(admin.id, admin.nombre)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-slate-900">Nuevo administrador</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre</label>
                  <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Apellido</label>
                  <input value={form.apellido} onChange={e => setForm(p => ({ ...p, apellido: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Contraseña (mín. 8 caracteres)</label>
                <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Rol</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setForm(p => ({ ...p, role: "ADMIN" }))} className={`py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${form.role === "ADMIN" ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 text-slate-500"}`}>
                    🛡️ ADMIN
                  </button>
                  <button onClick={() => setForm(p => ({ ...p, role: "SUPER_ADMIN" }))} className={`py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${form.role === "SUPER_ADMIN" ? "border-amber-500 bg-amber-500 text-white" : "border-slate-200 text-slate-500"}`}>
                    ⚡ SUPER_ADMIN
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600">Cancelar</button>
              <button onClick={handleCreate} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-900 text-white text-sm font-bold disabled:opacity-50">
                {saving ? "Creando..." : "Crear administrador"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {resetPasswordId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Nueva contraseña</h3>
              <button onClick={() => setResetPasswordId(null)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setResetPasswordId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600">Cancelar</button>
              <button onClick={() => handleResetPassword(resetPasswordId)} disabled={saving || newPassword.length < 8} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-900 text-white text-sm font-bold disabled:opacity-50">
                <Check className="h-4 w-4" /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
