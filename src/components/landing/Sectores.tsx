"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const sectores = [
  { emoji: "🏦", title: "Aseguradoras", desc: "Abastecimiento de piezas para reparación de vehículos siniestrados con precios corporativos." },
  { emoji: "🏢", title: "Concesionarias", desc: "Stock garantizado de repuestos originales y alternativos para servicio post-venta." },
  { emoji: "🚗", title: "Empresas de Renting", desc: "Mantenimiento preventivo y correctivo para flotas de vehículos arrendados." },
  { emoji: "📋", title: "Empresas de Leasing", desc: "Soporte técnico y de repuestos para vehículos bajo contrato de arrendamiento financiero." },
  { emoji: "🚌", title: "Flotas Corporativas", desc: "Programa de mantenimiento integral para flotas propias de grandes empresas." },
  { emoji: "🔧", title: "Talleres Autorizados", desc: "Abastecimiento continuo de piezas certificadas con condiciones preferenciales." },
];

export function Sectores() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="sectores" ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">
            Sectores que atendemos
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mt-3">
            Soluciones para cada{" "}
            <span className="text-blue-900">tipo de empresa</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectores.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="group border border-slate-200 rounded-2xl p-8 hover:border-blue-900 hover:shadow-lg transition-all"
            >
              <div className="text-4xl mb-4">{s.emoji}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-900 transition-colors">
                {s.title}
              </h3>
              <p className="text-slate-500 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
