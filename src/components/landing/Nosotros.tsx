"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Globe, Award, Users, TrendingUp } from "lucide-react";

const pillars = [
  {
    icon: Globe,
    title: "Importación global",
    desc: "Traemos las mejores autopartes de Asia, Europa y América directamente a Perú con certificación de calidad.",
  },
  {
    icon: Award,
    title: "Calidad certificada",
    desc: "Todos nuestros productos pasan por rigurosos controles de calidad y cuentan con garantía respaldada.",
  },
  {
    icon: Users,
    title: "Atención especializada",
    desc: "Equipo técnico disponible para asesorarle en la selección correcta de piezas para cada vehículo.",
  },
  {
    icon: TrendingUp,
    title: "Crecimiento con usted",
    desc: "Líneas de crédito flexibles y precios preferenciales que escalan con el volumen de su empresa.",
  },
];

export function Nosotros() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="nosotros" ref={ref} className="py-24 bg-white">
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
              Más de 15 años{" "}
              <span className="text-blue-900">impulsando empresas</span>
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              Somos una empresa peruana especializada en la importación y distribución
              de autopartes de alta calidad. Trabajamos exclusivamente con empresas,
              ofreciendo un servicio B2B personalizado y eficiente.
            </p>
            <p className="text-slate-600 leading-relaxed mb-8">
              Nuestro catálogo cuenta con más de 10,000 referencias para las
              principales marcas del mercado peruano. Desde frenos hasta sistemas
              eléctricos, somos su socio estratégico para mantener sus vehículos
              operativos.
            </p>
            <div className="flex items-center gap-8">
              <div>
                <div className="text-3xl font-black text-blue-900">500+</div>
                <div className="text-sm text-slate-500">Empresas socias</div>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div>
                <div className="text-3xl font-black text-blue-900">98%</div>
                <div className="text-sm text-slate-500">Satisfacción</div>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div>
                <div className="text-3xl font-black text-blue-900">24h</div>
                <div className="text-sm text-slate-500">Tiempo entrega Lima</div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-slate-50 rounded-2xl p-6 hover:bg-blue-50 transition-colors group"
              >
                <pillar.icon className="h-8 w-8 text-blue-900 mb-3 group-hover:text-red-600 transition-colors" />
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
