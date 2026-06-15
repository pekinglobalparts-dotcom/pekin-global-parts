"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#nosotros", label: "Nosotros" },
  { href: "#beneficios", label: "Beneficios" },
  { href: "#catalogo", label: "Catálogo" },
  { href: "#sectores", label: "Sectores" },
  { href: "#afiliacion", label: "Afiliación" },
  { href: "#contacto", label: "Contacto" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);

      // Active section detection
      const sections = navLinks.map(l => l.href.replace("#", ""));
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white text-xs font-black">PK</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className={cn("text-base font-black tracking-tight transition-colors", scrolled ? "text-blue-900" : "text-white")}>
                PEKÍN S&A
              </span>
              <span className={cn("text-[9px] font-bold tracking-[0.2em] transition-colors leading-none", scrolled ? "text-red-600" : "text-red-400")}>
                GLOBAL PARTS
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const id = link.href.replace("#", "");
              const isActive = activeSection === id;
              return (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? scrolled ? "text-blue-900 bg-blue-50" : "text-white bg-white/10"
                      : scrolled ? "text-slate-600 hover:text-blue-900 hover:bg-slate-50" : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login?role=socio">
              <Button
                variant={scrolled ? "outline" : "ghost"}
                size="sm"
                className={!scrolled ? "border-white/30 text-white hover:bg-white/10 hover:text-white" : ""}
              >
                Iniciar sesión
              </Button>
            </Link>
            <button onClick={() => handleNavClick("#afiliacion")}>
              <Button size="sm" variant="secondary">
                Solicitar acceso <ChevronRight className="h-4 w-4" />
              </Button>
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-lg transition-colors hover:bg-white/10"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            {mobileOpen
              ? <X className={cn("h-6 w-6", scrolled ? "text-slate-900" : "text-white")} />
              : <Menu className={cn("h-6 w-6", scrolled ? "text-slate-900" : "text-white")} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-1">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="block w-full text-left px-4 py-3 text-slate-700 font-medium hover:text-blue-900 hover:bg-blue-50 rounded-xl transition-colors"
                  onClick={() => handleNavClick(link.href)}
                >
                  {link.label}
                </motion.button>
              ))}
              <div className="pt-4 flex flex-col gap-3 border-t border-slate-100">
                <Link href="/login?role=socio">
                  <Button variant="outline" className="w-full">
                    Iniciar sesión
                  </Button>
                </Link>
                <button onClick={() => handleNavClick("#afiliacion")} className="w-full">
                  <Button variant="secondary" className="w-full">
                    Solicitar acceso <ChevronRight className="h-4 w-4" />
                  </Button>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
