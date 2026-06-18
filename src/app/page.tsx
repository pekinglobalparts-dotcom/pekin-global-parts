"use client";

import { useState, useEffect } from "react";
import { Logo, LogoWhite } from "@/components/Logo";

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51953096242";

function waLink(msg: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

const BRANDS = [
  { name: "Toyota",      color: "#CC0000" },
  { name: "Nissan",      color: "#C3002F" },
  { name: "Mitsubishi",  color: "#E60026" },
  { name: "Hyundai",     color: "#002C5F" },
  { name: "Kia",         color: "#05141F" },
  { name: "Volkswagen",  color: "#001E50" },
  { name: "Chevrolet",   color: "#D4AF37" },
  { name: "Ford",        color: "#003DA5" },
  { name: "BYD",         color: "#1DB954" },
  { name: "Chery",       color: "#CC0000" },
  { name: "JAC",         color: "#003087" },
  { name: "Jetour",      color: "#1a1a2e" },
  { name: "Land Rover",  color: "#005A2B" },
  { name: "Jeep",        color: "#1B1B1B" },
  { name: "Honda",       color: "#CC0000" },
  { name: "Mazda",       color: "#910000" },
  { name: "Suzuki",      color: "#003087" },
];

const WA_ICON = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { label: "Inicio",    href: "#inicio" },
    { label: "Marcas",    href: "#marcas" },
    { label: "Nosotros",  href: "#nosotros" },
    { label: "Contacto",  href: "#contacto" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#inicio" aria-label="Pekín S&A inicio">
            <Logo compact />
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <a key={l.label} href={l.href} className="text-sm font-semibold text-slate-700 hover:text-[#e8121a] transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://socios.pekinglobalparts.com/login"
              className="text-sm font-bold text-[#1a1f6e] border border-[#1a1f6e] px-4 py-2 rounded-full hover:bg-[#1a1f6e] hover:text-white transition-colors"
            >
              Portal Socios
            </a>
            <a
              href={waLink("Hola, quiero consultar sobre un repuesto")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-4 py-2 rounded-full transition-colors"
            >
              {WA_ICON}
              WhatsApp
            </a>
          </div>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menú"
          >
            <div className={`w-5 h-0.5 bg-slate-700 transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
            <div className={`w-5 h-0.5 bg-slate-700 my-1 transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <div className={`w-5 h-0.5 bg-slate-700 transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pb-4">
          {navLinks.map(l => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className="block py-3 text-sm font-semibold text-slate-700 hover:text-[#e8121a] border-b border-slate-50 last:border-0 transition-colors">
              {l.label}
            </a>
          ))}
          <div className="mt-3 flex flex-col gap-2">
            <a href="https://socios.pekinglobalparts.com/login" className="flex items-center justify-center text-sm font-bold text-[#1a1f6e] border border-[#1a1f6e] px-4 py-2.5 rounded-full">
              Portal Socios
            </a>
            <a href={waLink("Hola, quiero consultar sobre un repuesto")} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-green-500 text-white font-bold text-sm px-4 py-2.5 rounded-full">
              {WA_ICON} WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

// ── Hero con dos caminos ────────────────────────────────────────────────────────
function Hero() {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center bg-[#e8121a] overflow-hidden pt-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#1a1f6e]/30 rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-white/5 rounded-full" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center py-20">
        <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-8 tracking-wider uppercase">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          Importación directa · +17 marcas
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-tight mb-6">
          Tu repuesto,<br />
          <span className="text-white/85">donde lo necesitas</span>
        </h1>

        <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed">
          Pastillas, amortiguadores, frenos y más — para tu vehículo personal o toda tu flota empresarial.
        </p>

        {/* Dos caminos */}
        <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {/* Cliente individual */}
          <a
            href={waLink("Hola, quiero consultar sobre un repuesto para mi vehículo")}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-2xl p-6 text-left hover:shadow-2xl transition-all hover:-translate-y-1"
          >
            <div className="text-3xl mb-3">🔧</div>
            <h2 className="text-[#e8121a] font-black text-lg leading-tight mb-2">Soy cliente particular</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Busco repuestos para mi auto. Consulta por WhatsApp y te cotizamos al instante.
            </p>
            <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
              {WA_ICON}
              Consultar ahora
            </div>
          </a>

          {/* Empresa / socio */}
          <a
            href="https://socios.pekinglobalparts.com/login"
            className="group bg-[#1a1f6e] rounded-2xl p-6 text-left hover:shadow-2xl transition-all hover:-translate-y-1"
          >
            <div className="text-3xl mb-3">🏢</div>
            <h2 className="text-white font-black text-lg leading-tight mb-2">Tengo una empresa</h2>
            <p className="text-blue-200 text-sm leading-relaxed mb-4">
              Renting, taller, aseguradora o flota. Accede a precios B2B, crédito y atención prioritaria.
            </p>
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <span>→</span>
              Ingresar al portal
            </div>
          </a>
        </div>

        {/* Stats */}
        <div className="mt-14 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { n: "17+", label: "Marcas" },
            { n: "24h", label: "Respuesta" },
            { n: "100%", label: "Garantía" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-black text-white">{s.n}</div>
              <div className="text-white/60 text-xs font-semibold uppercase tracking-wide mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Marcas ─────────────────────────────────────────────────────────────────────
function Marcas() {
  return (
    <section id="marcas" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
            Repuestos para tu marca
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Selecciona tu marca y te enviamos cotización por WhatsApp
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {BRANDS.map(brand => (
            <a
              key={brand.name}
              href={waLink(`Hola, necesito repuestos para mi ${brand.name}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
            >
              <div
                className="h-2 w-full"
                style={{ backgroundColor: brand.color }}
              />
              <div className="p-5 flex flex-col items-center justify-center gap-2">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-inner"
                  style={{ backgroundColor: brand.color }}
                >
                  {brand.name[0]}
                </div>
                <span className="text-sm font-bold text-slate-800 text-center">{brand.name}</span>
                <span className="text-[10px] text-green-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  {WA_ICON}
                  Consultar
                </span>
              </div>
            </a>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="text-slate-500 text-sm">¿No encuentras tu marca?</p>
          <a
            href={waLink("Hola, necesito repuestos para mi vehículo que no está en la lista")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-2 text-green-600 font-bold hover:text-green-700 transition-colors"
          >
            {WA_ICON}
            Consúltanos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Nosotros ───────────────────────────────────────────────────────────────────
function Nosotros() {
  return (
    <section id="nosotros" className="py-20 bg-[#1a1f6e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block bg-white/10 text-white/80 text-xs font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-widest">
              Sobre nosotros
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 leading-tight">
              Tu aliado en movimiento
            </h2>
            <p className="text-blue-200 leading-relaxed mb-6">
              Pekín Global Parts SAC es una empresa peruana importadora de repuestos automotrices con presencia en Lima. Trabajamos directamente con fabricantes para garantizar calidad y precios competitivos.
            </p>
            <p className="text-blue-200 leading-relaxed mb-8">
              Atendemos tanto a clientes particulares como a empresas con flotas corporativas, rentings, aseguradoras y talleres especializados, con un servicio personalizado y respuesta en 24 horas.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "🎯", title: "Misión", desc: "Proveer repuestos de calidad con importación directa al mejor precio." },
                { icon: "🚀", title: "Visión", desc: "Ser el socio logístico preferido de las flotas empresariales del Perú." },
              ].map(v => (
                <div key={v.title} className="bg-white/10 rounded-xl p-4">
                  <div className="text-2xl mb-2">{v.icon}</div>
                  <div className="text-white font-bold text-sm mb-1">{v.title}</div>
                  <div className="text-blue-200 text-xs leading-relaxed">{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { n: "17+", label: "Marcas de vehículos", icon: "🚗" },
              { n: "24h", label: "Tiempo de respuesta", icon: "⚡" },
              { n: "100%", label: "Repuestos con garantía", icon: "✅" },
              { n: "B2B", label: "Portal exclusivo socios", icon: "🏢" },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-3xl font-black text-white mb-1">{s.n}</div>
                <div className="text-blue-200 text-xs leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Servicios ──────────────────────────────────────────────────────────────────
function Servicios() {
  const items = [
    { icon: "🔧", title: "Repuestos particulares", desc: "Pastillas, amortiguadores, frenos, filtros y más para tu vehículo personal. Cotización inmediata por WhatsApp." },
    { icon: "🚛", title: "Flotas empresariales", desc: "Gestión de repuestos para flotas corporativas con precios especiales, crédito y portal B2B dedicado." },
    { icon: "🔍", title: "Repuesto a pedido", desc: "¿No está en catálogo? Lo buscamos. Solicitamos directamente al fabricante para encontrar lo que necesitas." },
    { icon: "📦", title: "Importación directa", desc: "Trabajamos con importación directa para garantizar la trazabilidad y calidad de cada pieza." },
  ];
  return (
    <section id="servicios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Nuestros servicios</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Para cada necesidad, tenemos una solución</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(item => (
            <div key={item.title} className="bg-slate-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-black text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Empresa CTA ────────────────────────────────────────────────────────────────
function EmpresaCTA() {
  return (
    <section className="py-20 bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="text-4xl mb-4">🏢</div>
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
          ¿Tienes una empresa con flota?
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
          Accede a precios preferenciales, línea de crédito, portal de gestión exclusivo y atención prioritaria. Rentings, aseguradoras, talleres y corporativos.
        </p>
        <a
          href="https://socios.pekinglobalparts.com/login"
          className="inline-flex items-center gap-3 bg-[#e8121a] text-white font-black px-10 py-4 rounded-xl text-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          Quiero ser socio
          <span>→</span>
        </a>
        <p className="text-slate-500 text-sm mt-4">Sin costo de membresía · Aprobación en 24h</p>
      </div>
    </section>
  );
}

// ── Contacto ───────────────────────────────────────────────────────────────────
function Contacto() {
  return (
    <section id="contacto" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Contáctanos</h2>
          <p className="text-slate-500">Estamos disponibles para atenderte</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { icon: "📱", title: "WhatsApp", desc: "+51 953 096 242", href: waLink("Hola, quiero más información") },
            { icon: "📧", title: "Email", desc: "ventas@pekinglobalparts.com", href: "mailto:ventas@pekinglobalparts.com" },
            { icon: "📍", title: "Ubicación", desc: "Lima, Perú", href: "#" },
          ].map(c => (
            <a key={c.title} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
              className="bg-slate-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow group">
              <div className="text-4xl mb-3">{c.icon}</div>
              <div className="font-bold text-slate-900 mb-1">{c.title}</div>
              <div className="text-slate-500 text-sm group-hover:text-[#e8121a] transition-colors">{c.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#0a0f1e] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-white/10">
          <LogoWhite compact />
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#marcas" className="hover:text-white transition-colors">Marcas</a>
            <a href="#nosotros" className="hover:text-white transition-colors">Nosotros</a>
            <a href="#servicios" className="hover:text-white transition-colors">Servicios</a>
            <a href="#contacto" className="hover:text-white transition-colors">Contacto</a>
            <a href="https://socios.pekinglobalparts.com/login" className="hover:text-white transition-colors">Portal Socios</a>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Pekín Global Parts SAC · RUC: 20612880396</p>
          <p>Hecho con ❤️ en Lima, Perú</p>
        </div>
      </div>
    </footer>
  );
}

// ── WhatsApp FAB ───────────────────────────────────────────────────────────────
function WhatsAppFAB() {
  return (
    <a
      href={waLink("Hola, quiero consultar sobre repuestos")}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all hover:scale-110"
      aria-label="Contactar por WhatsApp"
    >
      {WA_ICON}
    </a>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marcas />
        <Nosotros />
        <Servicios />
        <EmpresaCTA />
        <Contacto />
      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}
