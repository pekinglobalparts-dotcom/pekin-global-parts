"use client";

import { useState, useEffect } from "react";
import { Logo, LogoWhite } from "@/components/Logo";
import { X } from "lucide-react";

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

const FB_ICON = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const IG_ICON = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

// ── Navbar ─────────────────────────────────────────────────────────────────────
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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0f1f3d] shadow-lg" : "bg-[#0f1f3d]/95 backdrop-blur-sm"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#inicio" aria-label="Pekín Global Parts inicio">
            <LogoWhite compact />
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <a key={l.label} href={l.href} className="text-sm font-semibold text-blue-200 hover:text-white transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <a href="https://socios.pekinglobalparts.com/login" className="text-sm font-bold text-white border border-white/30 px-4 py-2 rounded-full hover:bg-white hover:text-[#0f1f3d] transition-colors">
              Portal Socios
            </a>
            <a href={waLink("Hola, quiero consultar sobre un repuesto")} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-4 py-2 rounded-full transition-colors">
              {WA_ICON} WhatsApp
            </a>
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setMenuOpen(v => !v)} aria-label="Menú">
            <div className={`w-5 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
            <div className={`w-5 h-0.5 bg-white my-1 transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <div className={`w-5 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-[#0f1f3d] border-t border-white/10 px-4 pb-4">
          {navLinks.map(l => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
              className="block py-3 text-sm font-semibold text-blue-200 hover:text-white border-b border-white/10 last:border-0 transition-colors">
              {l.label}
            </a>
          ))}
          <div className="mt-3 flex flex-col gap-2">
            <a href="https://socios.pekinglobalparts.com/login" className="flex items-center justify-center text-sm font-bold text-white border border-white/30 px-4 py-2.5 rounded-full">
              Portal Socios
            </a>
            <a href={waLink("Hola, quiero consultar sobre un repuesto")} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 text-white font-bold text-sm px-4 py-2.5 rounded-full">
              {WA_ICON} WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center bg-[#0f1f3d] overflow-hidden pt-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-[#e8121a]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-blue-900/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/2 rounded-full" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center py-20">
        <div className="inline-flex items-center gap-2 bg-white/10 text-blue-200 text-xs font-bold px-4 py-1.5 rounded-full mb-10 tracking-wider uppercase border border-white/10">
          <span className="w-1.5 h-1.5 bg-[#e8121a] rounded-full animate-pulse" />
          Importación directa · +17 marcas de vehículos
        </div>

        <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black text-white leading-none mb-2 tracking-tight">
          Tu aliado
        </h1>
        <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black text-[#e8121a] leading-none mb-10 tracking-tight">
          en movimiento
        </h1>

        <p className="text-xl sm:text-2xl text-blue-100/80 max-w-2xl mx-auto mb-14 leading-relaxed">
          Pastillas, amortiguadores, frenos y más — para tu vehículo personal o toda tu flota empresarial.
        </p>

        <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          <a href={waLink("Hola, quiero consultar sobre un repuesto para mi vehículo")} target="_blank" rel="noopener noreferrer"
            className="group bg-white rounded-2xl p-7 text-left hover:shadow-2xl hover:shadow-white/10 transition-all hover:-translate-y-1">
            <div className="text-3xl mb-3">🔧</div>
            <h2 className="text-[#0f1f3d] font-black text-xl leading-tight mb-2">Soy cliente particular</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-5">
              Busca tu repuesto por marca de vehículo. Cotizamos al instante por WhatsApp.
            </p>
            <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
              {WA_ICON} Consultar ahora
            </div>
          </a>

          <a href="https://socios.pekinglobalparts.com/login"
            className="group bg-[#e8121a] rounded-2xl p-7 text-left hover:shadow-2xl hover:shadow-red-900/30 transition-all hover:-translate-y-1">
            <div className="text-3xl mb-3">🏢</div>
            <h2 className="text-white font-black text-xl leading-tight mb-2">Tengo una empresa</h2>
            <p className="text-red-100 text-sm leading-relaxed mb-5">
              Renting, taller, aseguradora o flota. Precios B2B, línea de crédito y portal exclusivo.
            </p>
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <span>→</span> Ingresar al portal
            </div>
          </a>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
          {[{ n: "17+", label: "Marcas" }, { n: "24h", label: "Respuesta" }, { n: "100%", label: "Garantía" }].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-black text-white">{s.n}</div>
              <div className="text-blue-300/70 text-xs font-semibold uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Carrusel de marcas (infinite marquee) ──────────────────────────────────────
function MarcasCarrusel() {
  const doubled = [...BRANDS, ...BRANDS];
  return (
    <div className="bg-white py-6 border-y border-slate-100 overflow-hidden">
      <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Trabajamos con las principales marcas del mercado</p>
      <div className="relative">
        <div className="flex animate-marquee gap-6 w-max">
          {doubled.map((brand, i) => (
            <a
              key={i}
              href={waLink(`Hola, necesito repuestos para mi ${brand.name}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 group shrink-0"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-110 transition-transform"
                style={{ backgroundColor: brand.color }}
              >
                {brand.name[0]}
              </div>
              <span className="text-xs font-semibold text-slate-600 group-hover:text-[#e8121a] transition-colors">{brand.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Marcas grid ────────────────────────────────────────────────────────────────
function Marcas() {
  return (
    <section id="marcas" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Repuestos para tu marca</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Selecciona tu marca y te enviamos cotización por WhatsApp</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {BRANDS.map(brand => (
            <a key={brand.name} href={waLink(`Hola, necesito repuestos para mi ${brand.name}`)} target="_blank" rel="noopener noreferrer"
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="h-2 w-full" style={{ backgroundColor: brand.color }} />
              <div className="p-5 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg" style={{ backgroundColor: brand.color }}>
                  {brand.name[0]}
                </div>
                <span className="text-sm font-bold text-slate-800 text-center">{brand.name}</span>
                <span className="text-[10px] text-green-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  {WA_ICON} Consultar
                </span>
              </div>
            </a>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="text-slate-500 text-sm">¿No encuentras tu marca?</p>
          <a href={waLink("Hola, necesito repuestos para mi vehículo que no está en la lista")} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-2 text-green-600 font-bold hover:text-green-700 transition-colors">
            {WA_ICON} Consúltanos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Nosotros ───────────────────────────────────────────────────────────────────
function Nosotros() {
  return (
    <section id="nosotros" className="py-20 bg-[#0f1f3d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block bg-white/10 text-blue-200 text-xs font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-widest border border-white/10">
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
                <div key={v.title} className="bg-white/10 rounded-xl p-4 border border-white/5">
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
              <div key={s.label} className="bg-white/10 rounded-2xl p-6 text-center border border-white/5">
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
    { icon: "🔍", title: "Repuesto a pedido", desc: "¿No está listado? Lo buscamos. Solicitamos directamente al fabricante para encontrar lo que necesitas." },
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
            <div key={item.title} className="bg-slate-50 rounded-2xl p-6 hover:shadow-lg transition-shadow border border-slate-100">
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
    <section className="py-20 bg-[#e8121a]">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="text-4xl mb-4">🏢</div>
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
          ¿Tienes una empresa con flota?
        </h2>
        <p className="text-red-100 max-w-xl mx-auto mb-8 leading-relaxed">
          Accede a precios preferenciales, línea de crédito, portal de gestión exclusivo y atención prioritaria. Rentings, aseguradoras, talleres y corporativos.
        </p>
        <a href="https://socios.pekinglobalparts.com/login"
          className="inline-flex items-center gap-3 bg-white text-[#e8121a] font-black px-10 py-4 rounded-xl text-lg hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
          Quiero ser socio <span>→</span>
        </a>
        <p className="text-red-200 text-sm mt-4">Sin costo de membresía · Aprobación en 24h</p>
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
            { icon: "📍", title: "Oficina / Almacén", desc: "El Agustino, Lima, Perú", href: "#" },
          ].map(c => (
            <a key={c.title} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
              className="bg-slate-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow group border border-slate-100">
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

// ── Libro de Reclamaciones + Reseñas ──────────────────────────────────────────
function ReclamacionesResenas() {
  const [showModal, setShowModal] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ nombre: "", dni: "", email: "", tipo: "queja", descripcion: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/reclamacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="py-16 bg-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Libro de Reclamaciones */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl">📋</div>
                <div>
                  <h3 className="font-black text-slate-900">Libro de Reclamaciones</h3>
                  <p className="text-xs text-slate-400">Obligatorio por ley · INDECOPI</p>
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                Tu opinión es importante. Si tienes alguna queja o sugerencia, déjanos saber. Respondemos en 48 horas.
              </p>
              <button
                onClick={() => { setShowModal(true); setSent(false); }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                Presentar Reclamación
              </button>
            </div>

            {/* Reseñas */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">⭐</div>
                <div>
                  <h3 className="font-black text-slate-900">Déjanos tu Reseña</h3>
                  <p className="text-xs text-slate-400">Tu experiencia nos ayuda a mejorar</p>
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                ¿Tuviste una buena experiencia? Comparte tu opinión en Google y ayúdanos a seguir creciendo.
              </p>
              <a
                href="https://g.page/r/CXNskH5S5I5BECE/review"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors text-center"
              >
                ⭐ Dejar Reseña en Google
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Reclamación */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-slate-900 text-lg">📋 Libro de Reclamaciones</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            {sent ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <p className="font-bold text-slate-900 mb-2">Reclamación registrada</p>
                <p className="text-slate-500 text-sm">Te respondemos dentro de las próximas 48 horas.</p>
                <button onClick={() => setShowModal(false)} className="mt-6 bg-slate-900 text-white font-bold px-6 py-2.5 rounded-xl text-sm">
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Nombre completo *</label>
                    <input required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">DNI / RUC *</label>
                    <input required value={form.dni} onChange={e => setForm(f => ({ ...f, dni: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Correo electrónico *</label>
                  <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Tipo</label>
                  <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                    <option value="queja">Queja</option>
                    <option value="reclamo">Reclamo</option>
                    <option value="sugerencia">Sugerencia</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Descripción *</label>
                  <textarea required rows={4} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                    placeholder="Describe detalladamente tu queja, reclamo o sugerencia..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
                    {loading ? "Enviando..." : "Enviar Reclamación"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#0a0f1e] text-white">
      {/* Métodos de pago */}
      <div className="border-b border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Métodos de pago aceptados</p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {/* Visa */}
            <div className="bg-white rounded-lg px-3 py-1.5 flex items-center">
              <span className="text-[#1a1f6e] font-black text-lg tracking-tight italic">VISA</span>
            </div>
            {/* Mastercard */}
            <div className="bg-white rounded-lg px-3 py-1.5 flex items-center gap-1">
              <div className="w-5 h-5 bg-red-500 rounded-full opacity-90" />
              <div className="w-5 h-5 bg-yellow-400 rounded-full -ml-2 opacity-90" />
              <span className="text-slate-700 font-bold text-xs ml-1">Mastercard</span>
            </div>
            {/* Transferencia */}
            <div className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              <span className="text-white text-xs font-bold">🏦 Transferencia</span>
            </div>
            {/* Yape */}
            <div className="bg-[#6b21a8] rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              <span className="text-white text-xs font-black">Yape</span>
            </div>
            {/* Plin */}
            <div className="bg-[#00b4d8] rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              <span className="text-white text-xs font-black">Plin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Links y redes */}
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8 pb-8 border-b border-white/10">
            <LogoWhite compact />
            <div className="flex gap-6 text-sm text-slate-400 flex-wrap justify-center">
              <a href="#marcas" className="hover:text-white transition-colors">Marcas</a>
              <a href="#nosotros" className="hover:text-white transition-colors">Nosotros</a>
              <a href="#servicios" className="hover:text-white transition-colors">Servicios</a>
              <a href="#contacto" className="hover:text-white transition-colors">Contacto</a>
              <a href="https://socios.pekinglobalparts.com/login" className="hover:text-white transition-colors">Portal Socios</a>
            </div>
            {/* Redes sociales */}
            <div className="flex items-center gap-3">
              <a href="https://facebook.com/pekinglobalparts" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#1877f2] flex items-center justify-center transition-colors" aria-label="Facebook">
                {FB_ICON}
              </a>
              <a href="https://instagram.com/pekinglobalparts" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 flex items-center justify-center transition-colors" aria-label="Instagram">
                {IG_ICON}
              </a>
              <a href={waLink("Hola, quiero más información sobre Pekín Global Parts")} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-green-500 flex items-center justify-center transition-colors" aria-label="WhatsApp">
                {WA_ICON}
              </a>
            </div>
          </div>
          <div className="text-center text-sm text-slate-500">
            <p>© {new Date().getFullYear()} Pekín Global Parts SAC · RUC: 20612880396 · Lima, Perú</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── WhatsApp FAB ───────────────────────────────────────────────────────────────
function WhatsAppFAB() {
  return (
    <a href={waLink("Hola, quiero consultar sobre repuestos")} target="_blank" rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all hover:scale-110"
      aria-label="Contactar por WhatsApp">
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
        <MarcasCarrusel />
        <Marcas />
        <Nosotros />
        <Servicios />
        <EmpresaCTA />
        <Contacto />
        <ReclamacionesResenas />
      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}
