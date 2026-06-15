import Link from "next/link";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";

export function Footer() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51953096242";

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <span className="text-2xl font-black text-white">PEKIN</span>
              <span className="text-sm font-semibold text-red-400 block tracking-widest">
                GLOBAL PARTS
              </span>
              <p className="text-xs text-slate-500 mt-1">TU ALIADO EN MOVIMIENTO</p>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-6">
              Importadores especializados de autopartes de alta calidad para flotas
              empresariales, concesionarias y talleres autorizados en todo el Perú.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "#nosotros", label: "Nosotros" },
                { href: "#beneficios", label: "Beneficios" },
                { href: "#catalogo", label: "Catálogo" },
                { href: "#sectores", label: "Sectores que atendemos" },
                { href: "#afiliacion", label: "Solicitar afiliación" },
                { href: "#faq", label: "Preguntas frecuentes" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-1 text-xs text-slate-600">Inicio de actividades: 2024</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <span>Jr. Cerro Azul 2147, El Agustino, Lima</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-red-400 shrink-0" />
                <span>+51 953 096 242</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-red-400 shrink-0" />
                <a
                  href="mailto:pekinglobalparts@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  pekinglobalparts@gmail.com
                </a>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="text-white font-semibold mb-3">Portal clientes</h4>
              <div className="space-y-2">
                <Link
                  href="/login?role=socio"
                  className="block text-sm hover:text-white transition-colors"
                >
                  → Acceso socios
                </Link>
                <Link
                  href="/login?role=admin"
                  className="block text-sm hover:text-white transition-colors"
                >
                  → Administración
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Pekin Global Parts S.A.C. Todos los derechos reservados.</p>
          <p>RUC: 20612880396 | Lima, Perú</p>
        </div>
      </div>
    </footer>
  );
}
