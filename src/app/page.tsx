"use client";

import { useState, useEffect } from "react";
import { Logo, LogoWhite } from "@/components/Logo";

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51953096242";

function waLink(msg: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

// ── Brand data ─────────────────────────────────────────────────────────────────
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
    { label: "Inicio",   href: "#inicio" },
    { label: "Marcas",   href: "#marcas" },
    { label: "Nosotros", href: "#nosotros" },
    { label: "Contacto", href: "#contacto" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#inicio" aria-label="Pekín S&A inicio">
            <Logo compact />
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-semibold text-slate-700 hover:text-[#e8121a] transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* WhatsApp CTA */}
          <div className="hidden md:block">
            <a
              href={waLink("Hola, me gustaría obtener más información sobre Pekín S&A")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-4 py-2 rounded-full transition-colors"
            >
              {WA_ICON}
              WhatsApp
            </a>
          </div>

          {/* Mobile hamburger */}
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

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pb-4">
          {navLinks.map(l => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-sm font-semibold text-slate-700 hover:text-[#e8121a] border-b border-slate-50 last:border-0 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href={waLink("Hola, me gustaría obtener más información sobre Pekín S&A")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 bg-green-500 text-white font-bold text-sm px-4 py-2.5 rounded-full"
          >
            WhatsApp
          </a>
        </div>
      )}
    </header>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center bg-[#e8121a] overflow-hidden pt-16"
    >
      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#1a1f6e]/30 rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-white/5 rounded-full" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-8 tracking-wider uppercase">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          Soluciones B2B para flotas
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-tight mb-6">
          Repuestos para tu flota,<br />
          <span className="text-white/85">cuando los necesitas</span>
        </h1>

        <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed">
          Soluciones de importación directa para empresas corporativas, flotas de renting,
          aseguradoras y talleres especializados. Más de 17 marcas de vehículos.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#marcas"
            className="bg-white text-[#e8121a] font-black px-8 py-4 rounded-xl text-base hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Ver marcas
          </a>
          <a
            href={waLink("Hola, me gustaría información sobre repuestos para mi flota")}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1a1f6e] text-white font-black px-8 py-4 rounded-xl text-base hover:bg-[#141a5e] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            {WA_ICON}
            Escríbenos
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 sm:gap-12 max-w-lg mx-auto">
          {[
            { num: "17+", label: "Marcas" },
            { num: "24h", label: "Respuesta" },
            { num: "B2B", label: "Especializado" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-white">{s.num}</p>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" className="w-full" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}

// ── Marcas ─────────────────────────────────────────────────────────────────────
function Marcas() {
  return (
    <section id="marcas" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-[#e8121a] text-xs font-bold uppercase tracking-widest">Marcas disponibles</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1a1f6e] mt-2">Todas las marcas, un solo proveedor</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Importación directa de repuestos originales y alternativos para las principales marcas del mercado peruano.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {BRANDS.map(brand => (
            <a
              key={brand.name}
              href={waLink(`Hola, necesito repuestos para ${brand.name}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-slate-100 hover:border-[#e8121a] hover:shadow-lg transition-all duration-200"
            >
              {/* Brand circle */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-110 transition-transform duration-200"
                style={{ backgroundColor: brand.color }}
              >
                {brand.name[0]}
              </div>
              <span className="text-sm font-bold text-slate-800 text-center leading-tight">{brand.name}</span>
              <span className="text-xs text-[#e8121a] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Ver repuestos →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Nosotros ───────────────────────────────────────────────────────────────────
function Nosotros() {
  return (
    <section id="nosotros" className="py-20 bg-[#1a1f6e]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-[#e8121a] text-xs font-bold uppercase tracking-widest">Quiénes somos</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">Pekín S&amp;A</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Quiénes somos",
              icon: "🏢",
              text: "Somos una empresa peruana especializada en importación y distribución de repuestos automotrices para flotas corporativas, aseguradoras y empresas de renting. Con años de experiencia, somos tu aliado estratégico en movimiento.",
            },
            {
              title: "Nuestra misión",
              icon: "🎯",
              text: "Proveer repuestos automotrices de calidad con rapidez, eficiencia y precios competitivos, siendo el socio de confianza para empresas que dependen de sus vehículos para operar.",
            },
            {
              title: "Nuestra visión",
              icon: "🚀",
              text: "Ser la empresa líder en soluciones de repuestos B2B en el Perú, expandiendo nuestra presencia a nivel latinoamericano y consolidándonos como referente en importación directa.",
            },
          ].map(item => (
            <div key={item.title} className="bg-white/10 rounded-2xl p-6 hover:bg-white/15 transition-colors">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-black text-white text-xl mb-3">{item.title}</h3>
              <p className="text-white/75 leading-relaxed text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Servicios ──────────────────────────────────────────────────────────────────
function Servicios() {
  const services = [
    {
      icon: "📦",
      title: "Importación directa",
      desc: "Traemos repuestos directamente de los fabricantes, eliminando intermediarios para ofrecerte los mejores precios y tiempos de entrega optimizados.",
    },
    {
      icon: "🚗",
      title: "Atención a flotas",
      desc: "Servicio especializado para empresas con flotas vehiculares: gestión centralizada, crédito empresarial y atención prioritaria 24/7.",
    },
    {
      icon: "🔧",
      title: "Repuestos especializados",
      desc: "Amplio catálogo de repuestos originales y alternativos certificados para más de 17 marcas, con garantía de calidad en cada pieza.",
    },
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-[#e8121a] text-xs font-bold uppercase tracking-widest">Lo que ofrecemos</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1a1f6e] mt-2">Nuestros servicios</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map(s => (
            <div key={s.title} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-slate-100">
              <div className="text-5xl mb-5">{s.icon}</div>
              <h3 className="font-black text-[#1a1f6e] text-xl mb-3">{s.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Contacto ───────────────────────────────────────────────────────────────────
function Contacto() {
  return (
    <section id="contacto" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <span className="text-[#e8121a] text-xs font-bold uppercase tracking-widest">Contáctanos</span>
        <h2 className="text-3xl sm:text-4xl font-black text-[#1a1f6e] mt-2 mb-4">¿Listo para trabajar juntos?</h2>
        <p className="text-slate-500 mb-10 max-w-xl mx-auto">
          Escríbenos por WhatsApp y recibe atención inmediata de nuestro equipo especializado.
        </p>

        {/* WhatsApp CTA */}
        <a
          href={waLink("Hola, me gustaría cotizar repuestos para mi empresa")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-black text-lg px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 mb-12"
        >
          {WA_ICON}
          Escríbenos ahora
        </a>

        {/* Contact details */}
        <div className="grid sm:grid-cols-3 gap-6 text-left">
          {[
            {
              icon: "✉️",
              label: "Correo",
              value: "ventas@pekinsa.com",
              href: "mailto:ventas@pekinsa.com",
            },
            {
              icon: "📍",
              label: "Ubicación",
              value: "Lima, Perú",
              href: undefined as string | undefined,
            },
            {
              icon: "🕐",
              label: "Horario",
              value: "Lun–Vie 8am–6pm · Sáb 9am–1pm",
              href: undefined as string | undefined,
            },
          ].map(item => (
            <div key={item.label} className="bg-slate-50 rounded-2xl p-5 flex gap-4 items-start">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="text-[#1a1f6e] font-semibold text-sm hover:underline">{item.value}</a>
                ) : (
                  <p className="text-[#1a1f6e] font-semibold text-sm">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function Footer() {
  const socials = [
    {
      name: "Instagram",
      href: "https://instagram.com/pekinsa",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: "https://facebook.com/pekinsa",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      name: "TikTok",
      href: "https://tiktok.com/@pekinsa",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.35 6.35 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.84 1.55V6.78a4.85 4.85 0 01-1.07-.09z"/>
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/pekinsa",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      href: waLink("Hola, me gustaría obtener más información"),
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      ),
    },
  ];

  const payments = [
    { name: "Visa",             bg: "#1A1F71", label: "VISA" },
    { name: "Mastercard",       bg: "#EB001B", label: "MC" },
    { name: "Diners Club",      bg: "#004B87", label: "DC" },
    { name: "American Express", bg: "#007BC1", label: "AMEX" },
  ];

  return (
    <footer className="bg-[#0f1245] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <LogoWhite compact />
            <p className="text-white/60 text-sm mt-4 max-w-sm leading-relaxed">
              Tu aliado en movimiento. Importación directa de repuestos automotrices para flotas corporativas, aseguradoras y empresas de renting en el Perú.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {socials.map(s => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">Navegación</h4>
            <ul className="space-y-2">
              {["Inicio", "Marcas", "Nosotros", "Contacto"].map(item => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="text-white/60 hover:text-white text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Payments */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">Métodos de pago</h4>
            <div className="flex flex-wrap gap-2">
              {payments.map(p => (
                <div
                  key={p.name}
                  className="flex items-center justify-center w-14 h-9 rounded-lg text-xs font-black text-white"
                  style={{ backgroundColor: p.bg }}
                  aria-label={p.name}
                >
                  {p.label}
                </div>
              ))}
            </div>
            <p className="text-white/40 text-xs mt-4">Transferencia, efectivo y más.</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/40 text-xs">© {new Date().getFullYear()} Pekín S&amp;A. Todos los derechos reservados.</p>
          <p className="text-white/40 text-xs">Lima, Perú</p>
        </div>
      </div>
    </footer>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marcas />
        <Nosotros />
        <Servicios />
        <Contacto />
      </main>
      <Footer />

      {/* Floating WhatsApp button */}
      <a
        href={waLink("Hola, me gustaría obtener más información sobre Pekín S&A")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
      >
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </>
  );
}
