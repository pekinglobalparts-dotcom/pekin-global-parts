"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Globe, Award, Users, TrendingUp } from "lucide-react";

const pillars = [
  { icon: Globe, title: "Importación global", desc: "Traemos las mejores autopartes de Asia, Europa y América directamente a Perú con certificación de calidad." },
  { icon: Award, title: "Calidad certificada", desc: "Todos nuestros productos pasan por rigurosos controles de calidad y cuentan con garantía respaldada." },
  { icon: Users, title: "Atención especializada", desc: "Equipo técnico disponible para asesorarle en la selección correcta de piezas para cada vehículo." },
  { icon: TrendingUp, title: "Crecimiento con usted", desc: "Líneas de crédito flexibles y precios preferenciales que escalan con el volumen de su empresa." },
];

const kpis = [
  { display: "Socios activos", label: "Empresas socias" },
  { display: "Alta satisfacción", label: "Satisfacción" },
  { display: "24h Lima", label: "Entrega Lima" },
];

export function Nosotros() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="nosotros" ref={ref} className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">
              Sobre nosotros
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mt-3 mb-6 leading-tight">
              Tu aliado{" "}
              <span className="text-blue-900">en movimiento</span>
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              Desde 2024, somos una empresa peruana especializada en la importación y distribución
              de autopartes de alta calidad. Trabajamos exclusivamente con empresas,
              ofreciendo un servicio B2B personalizado y eficiente.
            </p>
            <p className="text-slate-600 leading-relaxed mb-8">
              Nuestro catálogo en constante crecimiento incluye piezas para las
              principales marcas del mercado peruano. Desde frenos hasta sistemas
              eléctricos, somos su socio estratégico para mantener sus vehículos
              operativos.
            </p>

            <div className="flex items-center gap-8">
              {kpis.map((k, i) => (
                <div key={k.label}>
                  <div className="text-2xl font-black text-blue-900">
                    {k.display}
                  </div>
                  <div className="text-sm text-slate-500">{k.label}</div>
                </div>
              )).reduce<React.ReactNode[]>((acc, el, i) => [
                ...acc,
                ...(i > 0 ? [<div key={`div-${i}`} className="w-px h-12 bg-slate-200" />] : []),
                el,
              ], [])}
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-slate-50 rounded-2xl p-6 hover:bg-blue-50 transition-colors group cursor-default"
              >
                <div className="w-12 h-12 bg-blue-900/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-900/20 transition-colors">
                  <pillar.icon className="h-6 w-6 text-blue-900 group-hover:text-red-600 transition-colors" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{pillar.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
