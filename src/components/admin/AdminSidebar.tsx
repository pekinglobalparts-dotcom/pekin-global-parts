"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, FileText, Users, Package,
  ShoppingCart, Receipt, CreditCard, LogOut,
  ChevronRight, Database, UserCog, Search, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: FileText },
  { href: "/admin/socios", label: "Socios", icon: Users },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/cotizaciones", label: "Cotizaciones", icon: ShoppingCart },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/facturas", label: "Facturas", icon: Receipt },
  { href: "/admin/creditos", label: "Créditos", icon: CreditCard },
  { href: "/admin/solicitudes-repuesto", label: "Rep. específicos", icon: Search },
  { href: "/admin/datos", label: "Gestión de datos", icon: Database },
];

interface AdminSidebarProps {
  user: { name?: string | null; email?: string | null; adminRole?: string };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isSuperAdmin = user.adminRole === "SUPER_ADMIN";

  useEffect(() => { setOpen(false); }, [pathname]);

  const visibleLinks = [
    ...links,
    ...(isSuperAdmin ? [{ href: "/admin/administradores", label: "Administradores", icon: UserCog }] : []),
  ];

  const SidebarContent = () => (
    <>
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <Image src="/img/logo-pekin.jpg" alt="Pekín S&A" width={130} height={42} className="object-contain" />
          <button onClick={() => setOpen(false)} className="md:hidden text-white/60 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-2 px-2 py-1 bg-white/5 rounded-lg">
          <span className="text-slate-400 text-xs font-medium">Panel Administrativo</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleLinks.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                active
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <link.icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-slate-500 group-hover:text-white")} />
              <span className="flex-1">{link.label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <div className="px-3 py-3 rounded-xl bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.adminRole || "Admin"}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login?role=admin" })}
          className="flex items-center gap-3 text-slate-400 hover:text-white text-sm w-full px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#0f1f3d] flex items-center px-4 py-3 border-b border-white/10">
        <button onClick={() => setOpen(true)} className="text-white mr-3">
          <Menu className="h-6 w-6" />
        </button>
        <Image src="/img/logo-pekin.jpg" alt="Pekín S&A" width={110} height={36} className="object-contain" />
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "bg-[#0f1f3d] flex flex-col h-full border-r border-white/5 shrink-0",
        "fixed md:relative inset-y-0 left-0 z-50 w-64 transition-transform duration-300",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <SidebarContent />
      </aside>

      <div className="md:hidden h-14 shrink-0" />
    </>
  );
}
