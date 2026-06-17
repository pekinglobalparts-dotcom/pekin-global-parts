"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, FileText, Users, Package,
  ShoppingCart, Receipt, CreditCard, LogOut,
  ChevronRight, Settings, BarChart3, Database, UserCog, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: FileText, badge: "solicitudes" },
  { href: "/admin/socios", label: "Socios", icon: Users },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/cotizaciones", label: "Cotizaciones", icon: ShoppingCart, badge: "cotizaciones" },
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
  const isSuperAdmin = user.adminRole === "SUPER_ADMIN";

  const visibleLinks = [
    ...links,
    ...(isSuperAdmin ? [
      { href: "/admin/administradores", label: "Administradores", icon: UserCog },
    ] : []),
  ];

  return (
    <aside className="w-64 bg-[#0f1f3d] flex flex-col h-full border-r border-white/5">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-black text-xs">PK</span>
          </div>
          <div>
            <span className="text-white font-black text-sm leading-none">PEKIN</span>
            <span className="text-red-400 text-[10px] font-semibold block tracking-widest leading-none mt-0.5">
              GLOBAL PARTS
            </span>
          </div>
        </div>
        <div className="mt-3 px-2 py-1 bg-white/5 rounded-lg">
          <span className="text-slate-400 text-xs font-medium">Panel Administrativo</span>
        </div>
      </div>

      {/* Nav */}
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

      {/* User */}
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
    </aside>
  );
}
