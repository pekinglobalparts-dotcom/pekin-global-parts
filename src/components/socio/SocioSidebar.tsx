"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, ShoppingCart, Receipt, CreditCard,
  Package, Bell, LogOut, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/socio", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/socio/catalogo", label: "Catálogo", icon: Package },
  { href: "/socio/cotizaciones", label: "Cotizaciones", icon: FileText },
  { href: "/socio/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/socio/facturas", label: "Facturas", icon: Receipt },
  { href: "/socio/credito", label: "Línea de crédito", icon: CreditCard },
];

interface SocioSidebarProps {
  user: { name?: string | null; email?: string | null };
}

export function SocioSidebar({ user }: SocioSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-blue-950 flex flex-col h-full">
      <div className="p-6 border-b border-white/10">
        <span className="text-xl font-black text-white">PEKIN</span>
        <span className="text-xs text-red-400 block tracking-widest font-semibold">
          PORTAL SOCIOS
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
                  ? "bg-white/15 text-white"
                  : "text-blue-200 hover:bg-white/5 hover:text-white"
              )}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">
            {user.name?.[0] || "S"}
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
    </aside>
  );
}
