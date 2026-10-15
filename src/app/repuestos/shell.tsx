import Link from "next/link";
import Image from "next/image";

const WHATSAPP = "51953096242";

export interface Crumb { label: string; href?: string }

export function RepuestosShell({
  breadcrumbs, title, intro, children, waMsg,
}: {
  breadcrumbs: Crumb[];
  title: string;
  intro: string;
  children: React.ReactNode;
  waMsg?: string;
}) {
  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waMsg || "Hola Pekín Global Parts, quisiera cotizar un repuesto.")}`;
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#0f1f3d] text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/img/logo-pekin.jpg" alt="Pekín Global Parts" width={140} height={44} className="object-contain rounded" />
          </Link>
          <a href={wa} target="_blank" rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl">
            Cotizar por WhatsApp
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 w-full flex-1">
        {/* Breadcrumbs */}
        <nav className="text-xs text-slate-500 mb-4 flex flex-wrap items-center gap-1">
          <Link href="/" className="hover:text-[#0f1f3d]">Inicio</Link>
          {breadcrumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="text-slate-300">/</span>
              {c.href ? <Link href={c.href} className="hover:text-[#0f1f3d]">{c.label}</Link> : <span className="text-slate-700 font-semibold">{c.label}</span>}
            </span>
          ))}
        </nav>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{title}</h1>
        <p className="text-slate-600 mt-2 mb-6 max-w-3xl">{intro}</p>

        {children}

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-r from-[#0f1f3d] to-[#16294f] rounded-2xl p-6 text-white text-center">
          <p className="font-black text-lg">¿No encuentras tu repuesto?</p>
          <p className="text-blue-200 text-sm mt-1 mb-4">Escríbenos con la marca, modelo y año de tu vehículo. Te cotizamos al instante y enviamos a todo el Perú.</p>
          <a href={wa} target="_blank" rel="noopener noreferrer"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl">
            Cotizar por WhatsApp
          </a>
        </div>
      </main>

      <footer className="bg-[#0f1f3d] text-slate-400 text-sm">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Pekín Global Parts S.A.C. · Lima, Perú</p>
          <div className="flex gap-4">
            <Link href="/catalogo" className="hover:text-white">Catálogo</Link>
            <Link href="/repuestos" className="hover:text-white">Repuestos</Link>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-white">WhatsApp</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
