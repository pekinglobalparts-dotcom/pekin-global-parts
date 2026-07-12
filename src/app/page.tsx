import type { Metadata } from "next";
import { SovLogo } from "@/components/SovLogo";
import { SovGaleria, type GalItem } from "@/components/SovGaleria";

/* ============================================================
   SOV DECO PARTHY — Página informativa (una sola vista)
   Contacto: WhatsApp 942392029 · alexandramercadovargas@gmail.com
   ============================================================ */

const WA_NUMBER = "51942392029"; // Perú (+51) 942392029
const EMAIL = "alexandramercadovargas@gmail.com";

const waLink = (msg: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
const WA_DEFAULT = waLink("¡Hola SOV DECO PARTHY! Quisiera cotizar una decoración. Les cuento: ");
const WA_GALERIA = waLink("¡Hola SOV DECO PARTHY! Vi sus trabajos y me gustaría una decoración. ¿Me pueden cotizar?");

export const metadata: Metadata = {
  title: { absolute: "SOV DECO PARTHY | Decoración para tus eventos y celebraciones" },
};

function WhatsAppIcon({ className = "ico" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.898 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
    </svg>
  );
}

function Star() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0 L14.4 9.6 L24 12 L14.4 14.4 L12 24 L9.6 14.4 L0 12 L9.6 9.6 Z" />
    </svg>
  );
}

function Balloon({ color, size, id }: { color: string; size: number; id: string }) {
  return (
    <svg viewBox="0 0 60 82" width={size} height={(size * 82) / 60} aria-hidden="true">
      <defs>
        <radialGradient id={id} cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="55%" stopColor={color} />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>
      <ellipse cx="30" cy="30" rx="22" ry="27" fill={`url(#${id})`} />
      <path d="M30 57 l4 5 l-8 0 z" fill={color} />
      <path d="M30 62 q7 12 -1 20" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
      <ellipse cx="22" cy="21" rx="4" ry="6" fill="#fff" opacity="0.4" />
    </svg>
  );
}

const servicios = [
  { t: "Cumpleaños", d: "Para niños y adultos, con temáticas y estilos personalizados.", p: "M4 20h16v-6H4zM6 14v-3a2 2 0 012-2h8a2 2 0 012 2v3M12 9V5m0 0l1.5-1.5M12 5L10.5 3.5" },
  { t: "Baby Shower", d: "Ambientaciones dulces y delicadas para dar la bienvenida.", p: "M12 3a4 4 0 014 4v2a4 4 0 01-8 0V7a4 4 0 014-4zM6 21c0-3.3 2.7-6 6-6s6 2.7 6 6" },
  { t: "15 y 18 años", d: "Decoraciones elegantes para una fecha que merece brillar.", p: "M4 8l3 8h10l3-8-4 3-4-6-4 6z" },
  { t: "Bautizos", d: "Arreglos serenos y luminosos para un día muy especial.", p: "M12 4c2 3 6 3 6 7a6 6 0 01-12 0c0-4 4-4 6-7zM12 21v-4" },
  { t: "Aniversarios", d: "Detalles con encanto para celebrar el amor y los recuerdos.", p: "M9 9a3 3 0 100 6 3 3 0 000-6zM15 9a3 3 0 100 6 3 3 0 000-6zM7 8l2-4m6 4l-2-4" },
  { t: "Eventos especiales", d: "¿Otra ocasión? La ambientamos a la altura del momento.", p: "M12 3l2 5 5 .5-3.8 3.3L16.5 17 12 14.3 7.5 17l1.3-5.2L5 8.5 10 8z" },
];

// Cuando lleguen las fotos, se agrega `src` a cada una (ej. src: "/sov/galeria/1.jpg")
const galeria: GalItem[] = [
  { label: "Cumpleaños" },
  { label: "Baby Shower" },
  { label: "15 años" },
  { label: "Bautizo" },
  { label: "Aniversario" },
  { label: "Evento" },
];

const pasos = [
  { n: "01", t: "Escríbenos", d: "Cuéntanos qué celebras y para qué fecha, por WhatsApp." },
  { n: "02", t: "Comparte tu idea", d: "Envíanos la foto o el modelo de decoración que deseas." },
  { n: "03", t: "Recibe tu cotización", d: "Te preparamos una propuesta a tu medida, sin compromiso." },
];

export default function Home() {
  return (
    <div className="sovpage">
      {/* ===== Header ===== */}
      <header className="site-header">
        <div className="hrow">
          <a href="#inicio" aria-label="SOV DECO PARTHY inicio">
            <SovLogo variant="header" />
          </a>
          <a className="nav-cta" href={WA_DEFAULT} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon />
            Cotizar
          </a>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="hero" id="inicio">
        <span className="balloon float" style={{ left: "6%", top: "120px" }}>
          <Balloon color="#cbb6dd" size={58} id="b-hero-1" />
        </span>
        <span className="balloon float2" style={{ right: "7%", top: "90px" }}>
          <Balloon color="#d3a9bb" size={46} id="b-hero-2" />
        </span>
        <span className="balloon float" style={{ right: "15%", bottom: "70px" }}>
          <Balloon color="#e0cba0" size={40} id="b-hero-3" />
        </span>

        <div className="rise" style={{ position: "relative", display: "inline-block", padding: "14px 30px" }}>
          <span className="spark" style={{ top: "6%", left: "2%", width: 22, height: 22, animationDelay: ".2s" }}><Star /></span>
          <span className="spark" style={{ top: "-2%", right: "10%", width: 28, height: 28, animationDelay: ".9s" }}><Star /></span>
          <span className="spark" style={{ bottom: "14%", right: "1%", width: 17, height: 17, animationDelay: "1.5s" }}><Star /></span>
          <span className="spark" style={{ bottom: "2%", left: "12%", width: 19, height: 19, animationDelay: "1.1s" }}><Star /></span>
          <SovLogo variant="hero" />
        </div>

        <p className="tagline rise d1">
          Transformamos tus celebraciones en momentos inolvidables, con decoraciones y arreglos hechos a tu medida.
        </p>
        <div className="types rise d2">
          <span>Cumpleaños</span><span>Baby Shower</span><span>15 y 18 años</span><span>Bautizos</span><span>Eventos</span>
        </div>
        <div className="hero-cta rise d3">
          <a className="btn-wa" href={WA_DEFAULT} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon />
            Cotizar por WhatsApp
          </a>
          <a className="link-underline" href="#galeria">Ver nuestros trabajos</a>
        </div>
      </section>

      {/* ===== Servicios ===== */}
      <section className="block services">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Lo que decoramos</span>
            <h2 className="h">Cada celebración, una obra a tu medida</h2>
            <p className="lede">
              Diseñamos ambientaciones para toda ocasión, cuidando cada detalle para que refleje justo lo que imaginas.
            </p>
          </div>
          <div className="svc-grid">
            {servicios.map((s) => (
              <div className="svc" key={s.t}>
                <svg className="ic" viewBox="0 0 24 24"><path d={s.p} /></svg>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Galería ===== */}
      <section className="block" id="galeria">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Galería</span>
            <h2 className="h">Nuestros trabajos</h2>
            <p className="lede">
              Algunas de nuestras creaciones. ¿Te inspira alguna o tienes tu propio modelo? Lo hacemos realidad para ti.
            </p>
          </div>
          <SovGaleria items={galeria} waNumber={WA_NUMBER} />
          <p className="gal-note">Pronto agregaremos fotografías reales de nuestras decoraciones.</p>
        </div>
      </section>

      {/* ===== Proceso ===== */}
      <section className="block process">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Cómo trabajamos</span>
            <h2 className="h">Cotizar es muy sencillo</h2>
          </div>
          <div className="steps">
            {pasos.map((p) => (
              <div className="step" key={p.n}>
                <span className="num">{p.n}</span>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Contacto ===== */}
      <section className="contact" id="contacto">
        <div className="contact-panel">
          <span className="eyebrow">Contáctanos</span>
          <h2 className="h">Conversemos sobre tu próximo evento</h2>
          <p className="lede center">
            Escríbenos por WhatsApp y cuéntanos tu idea, o envíanos el modelo que deseas. Con gusto te asesoramos.
          </p>
          <a className="btn-wa" href={WA_GALERIA} target="_blank" rel="noopener noreferrer" style={{ marginTop: 10 }}>
            <WhatsAppIcon />
            Escribir por WhatsApp
          </a>
          <p className="info">
            <b>WhatsApp</b> 942 392 029 <span className="sep">·</span> {EMAIL}
          </p>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="site-footer">
        <div className="fcol">
          <SovLogo variant="footer" />
          <div className="frule" />
          <p className="ftag">Decoración y arreglos para cada celebración especial.</p>
          <div className="fsocial">
            <a href={WA_DEFAULT} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><WhatsAppIcon /></a>
            <a href={`mailto:${EMAIL}`} aria-label="Correo">
              <svg className="ico" viewBox="0 0 24 24"><path d="M3 5h18v14H3zM3 6l9 7 9-7" fill="none" stroke="#e7dced" strokeWidth="1.6" /></svg>
            </a>
          </div>
          <p className="copy">© {new Date().getFullYear()} SOV DECO PARTHY — Todos los derechos reservados</p>
        </div>
      </footer>

      {/* ===== Botón flotante ===== */}
      <a className="fab" href={WA_DEFAULT} target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp">
        <WhatsAppIcon />
      </a>
    </div>
  );
}
