import type { Metadata } from "next";

/* ============================================================
   SOV DECO PARTHY — Página informativa (una sola vista)
   Decoración para cumpleaños, baby shower, 15 y 18 años,
   bautizos y toda celebración.
   Contacto: WhatsApp 942392029 · alexandramercadovargas@gmail.com
   ============================================================ */

const WA_NUMBER = "51942392029"; // Perú (+51) 942392029
const EMAIL = "alexandramercadovargas@gmail.com";

const waLink = (msg: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

const WA_DEFAULT = waLink(
  "¡Hola SOV DECO PARTHY! 🎉 Quisiera cotizar una decoración. Les cuento: "
);

export const metadata: Metadata = {
  title: { absolute: "SOV DECO PARTHY | Decoración para tus eventos y celebraciones" },
};

/* --- Íconos --- */
function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.898 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* --- Globo decorativo --- */
function Balloon({
  color,
  className = "",
  size = 90,
}: {
  color: string;
  className?: string;
  size?: number;
}) {
  const id = color.replace("#", "");
  return (
    <div className={className} style={{ width: size }} aria-hidden="true">
      <svg viewBox="0 0 100 130" width={size} height={(size * 130) / 100}>
        <defs>
          <radialGradient id={`g-${id}`} cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="45%" stopColor={color} />
            <stop offset="100%" stopColor={color} />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="48" rx="38" ry="46" fill={`url(#g-${id})`} />
        <path d="M50 94 l6 8 l-12 0 z" fill={color} />
        <path d="M50 102 q10 14 0 28" stroke={color} strokeWidth="1.6" fill="none" opacity="0.5" />
        <ellipse cx="38" cy="34" rx="8" ry="12" fill="#ffffff" opacity="0.45" />
      </svg>
    </div>
  );
}

/* --- Datos --- */
const eventos = [
  { emoji: "🎂", titulo: "Cumpleaños", desc: "Para niños y adultos, temáticos y personalizados.", color: "from-pink-200 to-rose-200", ring: "ring-pink-300" },
  { emoji: "🍼", titulo: "Baby Shower", desc: "Dulces detalles para dar la bienvenida al bebé.", color: "from-sky-200 to-cyan-200", ring: "ring-sky-300" },
  { emoji: "👑", titulo: "15 y 18 Años", desc: "Decoraciones elegantes para una fecha inolvidable.", color: "from-violet-200 to-purple-200", ring: "ring-violet-300" },
  { emoji: "🕊️", titulo: "Bautizos", desc: "Arreglos tiernos y delicados para el gran día.", color: "from-teal-200 to-emerald-200", ring: "ring-teal-300" },
  { emoji: "💍", titulo: "Aniversarios", desc: "Sorpresas románticas y detalles con amor.", color: "from-fuchsia-200 to-pink-200", ring: "ring-fuchsia-300" },
  { emoji: "🎊", titulo: "Toda Celebración", desc: "¿Otra ocasión especial? ¡La decoramos para ti!", color: "from-amber-200 to-yellow-200", ring: "ring-amber-300" },
];

const pasos = [
  { n: "1", emoji: "💬", titulo: "Escríbenos por WhatsApp", desc: "Cuéntanos qué evento celebras y para qué fecha." },
  { n: "2", emoji: "📷", titulo: "Envíanos tu modelo", desc: "Mándanos la foto o idea de la decoración que deseas." },
  { n: "3", emoji: "🧾", titulo: "Recibe tu cotización", desc: "Te enviamos el presupuesto sin compromiso." },
  { n: "4", emoji: "🎉", titulo: "¡Decoramos tu día!", desc: "Hacemos realidad la decoración de tus sueños." },
];

// Espacios de galería (se reemplazan por las fotos reales de los trabajos)
const galeria = [
  { label: "Cumpleaños", grad: "from-pink-300 via-rose-200 to-fuchsia-200", emoji: "🎂" },
  { label: "Baby Shower", grad: "from-sky-300 via-cyan-200 to-blue-200", emoji: "🍼" },
  { label: "15 Años", grad: "from-violet-300 via-purple-200 to-indigo-200", emoji: "👑" },
  { label: "Bautizo", grad: "from-teal-300 via-emerald-200 to-green-200", emoji: "🕊️" },
  { label: "Arco de globos", grad: "from-fuchsia-300 via-pink-200 to-rose-200", emoji: "🎈" },
  { label: "Mesa temática", grad: "from-amber-300 via-yellow-200 to-orange-200", emoji: "🎊" },
];

export default function Home() {
  return (
    <main className="overflow-x-hidden text-slate-700">
      {/* ===== Barra superior (sin otras pestañas) ===== */}
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a href="#inicio" className="flex items-center gap-2" aria-label="SOV DECO PARTHY inicio">
            <span className="text-2xl">🎈</span>
            <span className="font-display text-xl font-extrabold tracking-tight text-purple-700 sm:text-2xl">
              SOV <span className="text-pink-500">DECO</span> PARTHY
            </span>
          </a>
          <a
            href={WA_DEFAULT}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-white shadow-md shadow-green-500/30 transition hover:brightness-105"
          >
            <WhatsAppIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Cotizar</span>
          </a>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section
        id="inicio"
        className="sov-gradient relative isolate overflow-hidden bg-gradient-to-br from-[#efe0ff] via-[#ffe3f3] to-[#e3f1ff] px-5 pb-24 pt-14 sm:pt-20"
      >
        {/* Globos flotantes */}
        <Balloon color="#c4a1f5" size={80} className="sov-float pointer-events-none absolute left-4 top-24 opacity-90 sm:left-16" />
        <Balloon color="#ff9ecb" size={64} className="sov-float-slow pointer-events-none absolute right-6 top-16 opacity-90 sm:right-24" />
        <Balloon color="#9ad9ff" size={54} className="sov-float pointer-events-none absolute right-10 top-56 hidden opacity-80 sm:block" />
        <Balloon color="#ffd76a" size={46} className="sov-float-slow pointer-events-none absolute left-10 top-64 hidden opacity-80 md:block" />

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="sov-rise inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-bold text-purple-600 shadow-sm ring-1 ring-white">
            ✨ Decoraciones que enamoran ✨
          </span>
          <h1 className="sov-rise mt-6 font-display text-4xl font-extrabold leading-tight text-purple-800 sm:text-6xl">
            SOV <span className="text-pink-500">DECO</span> PARTHY
          </h1>
          <p className="sov-rise mx-auto mt-5 max-w-xl text-lg font-semibold text-slate-600 sm:text-xl">
            Decoración y arreglos decorativos para{" "}
            <span className="text-purple-600">cumpleaños</span>,{" "}
            <span className="text-sky-500">baby shower</span>,{" "}
            <span className="text-fuchsia-500">15 y 18 años</span>,{" "}
            <span className="text-teal-500">bautizos</span> y toda celebración. 🎉
          </p>
          <div className="sov-rise mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={WA_DEFAULT}
              target="_blank"
              rel="noopener noreferrer"
              className="sov-wa-pulse inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-base font-extrabold text-white shadow-lg shadow-green-500/40 transition hover:brightness-105"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Cotiza por WhatsApp
            </a>
            <a
              href="#galeria"
              className="inline-flex items-center gap-2 rounded-full bg-white/80 px-7 py-3.5 text-base font-extrabold text-purple-700 shadow-md ring-1 ring-purple-200 transition hover:bg-white"
            >
              🖼️ Ver nuestros trabajos
            </a>
          </div>
          <p className="sov-rise mt-5 text-sm font-bold text-slate-500">
            📲 Escríbenos al{" "}
            <a href={WA_DEFAULT} target="_blank" rel="noopener noreferrer" className="text-green-600 underline-offset-2 hover:underline">
              942 392 029
            </a>
          </p>
        </div>

        {/* Onda inferior */}
        <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 40 C 360 90 1080 -10 1440 40 L1440 80 L0 80 Z" fill="#faf5ff" />
        </svg>
      </section>

      {/* ===== EVENTOS / SERVICIOS ===== */}
      <section id="eventos" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <div className="text-center">
          <h2 className="font-display text-3xl font-extrabold text-purple-800 sm:text-4xl">
            Decoramos cada momento especial 💜
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-semibold text-slate-500">
            Cualquiera sea tu celebración, la convertimos en un recuerdo inolvidable.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {eventos.map((e) => (
            <div
              key={e.titulo}
              className={`group rounded-3xl bg-gradient-to-br ${e.color} p-[2px] shadow-sm ring-1 ${e.ring} transition hover:-translate-y-1 hover:shadow-xl`}
            >
              <div className="flex h-full flex-col rounded-[calc(1.5rem-2px)] bg-white/85 p-6 backdrop-blur">
                <span className="text-4xl transition group-hover:scale-110">{e.emoji}</span>
                <h3 className="mt-4 font-display text-xl font-extrabold text-purple-800">{e.titulo}</h3>
                <p className="mt-2 text-sm font-medium text-slate-500">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== GALERÍA (trabajos reales) ===== */}
      <section id="galeria" className="bg-gradient-to-b from-white to-[#f4ecff] px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="font-display text-3xl font-extrabold text-purple-800 sm:text-4xl">
              Nuestros trabajos 🎨
            </h2>
            <p className="mx-auto mt-3 max-w-2xl font-semibold text-slate-500">
              Mira algunas de nuestras decoraciones. ¿Te gusta alguna o tienes tu propio modelo?
              ¡Escríbenos y la hacemos realidad para ti!
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
            {galeria.map((g) => (
              <div
                key={g.label}
                className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br ${g.grad} shadow-sm ring-1 ring-white`}
              >
                <div className="text-center">
                  <span className="block text-5xl drop-shadow-sm sm:text-6xl">{g.emoji}</span>
                  <span className="mt-2 block font-display text-sm font-extrabold text-white drop-shadow sm:text-base">
                    {g.label}
                  </span>
                </div>
                <span className="absolute bottom-2 right-3 text-[10px] font-bold uppercase tracking-wide text-white/80">
                  Próximamente foto
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a
              href={waLink("¡Hola SOV DECO PARTHY! 🎉 Vi sus trabajos y me encantaría una decoración similar. ¿Me pueden cotizar?")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-7 py-3.5 text-base font-extrabold text-white shadow-lg shadow-purple-500/30 transition hover:bg-purple-700"
            >
              💜 Quiero una decoración así
            </a>
          </div>
        </div>
      </section>

      {/* ===== CÓMO COTIZAR ===== */}
      <section id="como" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <div className="text-center">
          <h2 className="font-display text-3xl font-extrabold text-purple-800 sm:text-4xl">
            Cotizar es muy fácil 🥳
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-semibold text-slate-500">
            En 4 simples pasos tendrás la decoración de tus sueños.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pasos.map((p) => (
            <div key={p.n} className="relative rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-purple-100">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-2xl shadow-md">
                {p.emoji}
              </div>
              <span className="mt-4 block font-display text-sm font-black text-pink-400">PASO {p.n}</span>
              <h3 className="mt-1 font-display text-lg font-extrabold text-purple-800">{p.titulo}</h3>
              <p className="mt-2 text-sm font-medium text-slate-500">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CONTACTO / CTA FINAL ===== */}
      <section id="contacto" className="px-5 pb-20">
        <div className="sov-gradient mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 px-6 py-14 text-center shadow-2xl">
          <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
            ¿Lista/o para celebrar? 🎉
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg font-semibold text-white/90">
            Envíanos el modelo que deseas o cuéntanos tu idea. ¡Te cotizamos sin compromiso!
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={WA_DEFAULT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-8 py-4 text-lg font-extrabold text-white shadow-lg shadow-black/20 transition hover:brightness-105"
            >
              <WhatsAppIcon className="h-6 w-6" />
              WhatsApp: 942 392 029
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-2 rounded-full bg-white/90 px-8 py-4 text-lg font-extrabold text-purple-700 shadow-lg transition hover:bg-white"
            >
              ✉️ Escríbenos un correo
            </a>
          </div>

          <p className="mt-6 text-sm font-semibold text-white/80">📧 {EMAIL}</p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-purple-100 bg-white px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎈</span>
            <span className="font-display text-xl font-extrabold text-purple-700">
              SOV <span className="text-pink-500">DECO</span> PARTHY
            </span>
          </div>
          <p className="max-w-md text-sm font-medium text-slate-500">
            Decoración y arreglos decorativos para cumpleaños, baby shower, 15 y 18 años,
            bautizos y toda celebración especial. 💜
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm font-bold text-slate-600">
            <a href={WA_DEFAULT} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-green-600">
              <WhatsAppIcon className="h-4 w-4" /> 942 392 029
            </a>
            <a href={`mailto:${EMAIL}`} className="hover:text-purple-600">
              ✉️ {EMAIL}
            </a>
          </div>
          <p className="mt-2 text-xs font-medium text-slate-400">
            © {new Date().getFullYear()} SOV DECO PARTHY · Hecho con 💜 para tus celebraciones
          </p>
        </div>
      </footer>

      {/* ===== Botón flotante de WhatsApp ===== */}
      <a
        href={WA_DEFAULT}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className="sov-wa-pulse fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:brightness-105"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    </main>
  );
}
