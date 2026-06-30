"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, ShoppingCart, Receipt, CreditCard,
  Package, Bell, LogOut, FileText, UserCircle, Search, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SocioSidebarProps {
  user: { name?: string | null; email?: string | null };
}

export function SocioSidebar({ user }: SocioSidebarProps) {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/socio/notificaciones")
      .then(r => r.json())
      .then(d => setUnread(d.unreadCount || 0))
      .catch(() => {});
  }, [pathname]);

  // Close sidebar on route change (mobile)
  useEffect(() => { setOpen(false); }, [pathname]);

  const links = [
    { href: "/socio", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/socio/catalogo", label: "Catálogo", icon: Package },
    { href: "/socio/cotizaciones", label: "Cotizaciones", icon: FileText },
    { href: "/socio/solicitudes-repuesto", label: "Repuesto específico", icon: Search },
    { href: "/socio/pedidos", label: "Pedidos", icon: ShoppingCart },
    { href: "/socio/facturas", label: "Facturas", icon: Receipt },
    { href: "/socio/credito", label: "Línea de crédito", icon: CreditCard },
    { href: "/socio/notificaciones", label: "Notificaciones", icon: Bell, badge: unread },
    { href: "/socio/perfil", label: "Mi perfil", icon: UserCircle },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Image src="/img/logo-pekin.jpg" alt="Pekín S&A" width={140} height={46} className="object-contain" />
          <span className="text-[10px] text-red-400 tracking-widest font-bold uppercase leading-none pl-0.5">Portal Socios</span>
        </div>
        <button onClick={() => setOpen(false)} className="md:hidden text-white/60 hover:text-white p-1">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {links.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-red-600 text-white"
                  : "text-blue-200 hover:bg-white/5 hover:text-white"
              )}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{link.label}</span>
              {link.badge ? (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {link.badge > 99 ? "99+" : link.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user.name?.[0]?.toUpperCase() || "S"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-blue-300 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login?role=socio" })}
          className="flex items-center gap-2 text-blue-300 hover:text-white text-sm w-full px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
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
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — drawer on mobile, fixed on desktop */}
      <aside className={cn(
        "bg-[#0f1f3d] flex flex-col h-full shrink-0 transition-transform duration-300",
        "fixed md:relative inset-y-0 left-0 z-50",
        "w-64",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <SidebarContent />
      </aside>

      {/* Spacer so main content doesn't hide under mobile top bar */}
      <div className="md:hidden h-14 shrink-0" />
    </>
  );
}
