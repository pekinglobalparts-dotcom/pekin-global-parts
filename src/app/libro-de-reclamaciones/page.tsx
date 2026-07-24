import type { Metadata } from "next";
import { SovLogo } from "@/components/SovLogo";
import { LibroReclamacionesForm } from "@/components/LibroReclamacionesForm";

export const metadata: Metadata = {
  title: "Libro de Reclamaciones",
  description:
    "Libro de Reclamaciones virtual de SOV DECO PARTY, conforme al Código de Protección y Defensa del Consumidor (Ley N° 29571 - INDECOPI).",
  robots: { index: false, follow: true },
};

export default function LibroDeReclamacionesPage() {
  return (
    <div className="sovpage">
      <header className="site-header">
        <div className="hrow">
          <a href="/" aria-label="SOV DECO PARTY inicio">
            <SovLogo variant="header" />
          </a>
          <a className="nav-cta" href="/">Volver al inicio</a>
        </div>
      </header>

      <section className="block lr-page">
        <div className="wrap lr-wrap">
          <div className="sec-head">
            <span className="eyebrow">INDECOPI</span>
            <h2 className="h">Libro de Reclamaciones</h2>
            <p className="lede">
              Conforme al Código de Protección y Defensa del Consumidor (Ley N° 29571). Completa el
              formulario y nos comunicaremos contigo en un plazo máximo de 15 días hábiles.
            </p>
          </div>

          <LibroReclamacionesForm />
        </div>
      </section>
    </div>
  );
}
