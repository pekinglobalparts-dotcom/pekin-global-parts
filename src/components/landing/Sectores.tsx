"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Car, RotateCcw, FileText, Bus, Wrench, ArrowRight } from "lucide-react";

const sectores = [
  {
    icon: Shield,
    title: "Aseguradoras",
    desc: "Abastecimiento de piezas para reparación de vehículos siniestrados con precios corporativos y trazabilidad completa.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    hover: "hover:border-blue-200 hover:bg-blue-50/50",
  },
  {
    icon: Car,
    title: "Concesionarias",
    desc: "Stock garantizado de repuestos originales y alternativos para servicio post-venta de todas las marcas.",
    color: "text-slate-700",
    bg: "bg-slate-100",
    hover: "hover:border-slate-300 hover:bg-slate-50",
  },
  {
    icon: RotateCcw,
    title: "Empresas de Renting",
    desc: "Mantenimiento preventivo y correctivo para flotas de vehículos arrendados con acuerdos de nivel de servicio.",
    color: "text-purple-600",
    bg: "bg-purple-50",
    hover: "hover:border-purple-200 hover:bg-purple-50/50",
  },
  {
    icon: FileText,
    title: "Empresas de Leasing",
    desc: "Soporte técnico y de repuestos para vehículos bajo contrato de arrendamiento financiero a largo plazo.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    hover: "hover:border-amber-200 hover:bg-amber-50/50",
  },
  {
    icon: Bus,
    title: "Flotas Corporativas",
    desc: "Programa de mantenimiento integral para flotas propias de grandes empresas con disponibilidad garantizada.",
    color: "text-green-700",
    bg: "bg-green-50",
    hover: "hover:border-green-200 hover:bg-green-50/50",
  },
  {
    icon: Wrench,
    title: "Talleres Autorizados",
    desc: "Abastecimiento continuo de piezas certificadas con condiciones preferenciales y asesoría técnica especializada.",
    color: "text-red-600",
    bg: "bg-red-50",
    hover: "hover:border-red-200 hover:bg-red-50/50",
  },
];

export function Sectores() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="sectores" ref={ref} className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-10"
        >
          <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">
            Sectores que atendemos
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mt-3">
            Soluciones para cada{" "}
            <span className="text-blue-900">tipo de empresa</span>
          </h2>
          <p className="text-slate-500 mt-4 max-w-xl mx-auto">
            Diseñamos condiciones comerciales específicas para cada segmento del mercado B2B automotriz peruano.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sectores.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 }}
              className={`group border border-slate-200 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${s.hover}`}
            >
              <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-blue-900 transition-colors">
                {s.title}
              </h3>
              <p className="text-slate-500 leading-relaxed text-sm mb-4">{s.desc}</p>
              <a
                href="#afiliacion"
                className={`inline-flex items-center gap-1 text-xs font-semibold ${s.color} opacity-0 group-hover:opacity-100 transition-opacity`}
              >
                Solicitar acceso <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
