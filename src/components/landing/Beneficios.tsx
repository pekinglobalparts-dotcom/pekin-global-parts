"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  CreditCard, Package, Clock, Headphones,
  FileText, Shield, BarChart3, Truck,
} from "lucide-react";

const beneficios = [
  { icon: CreditCard, title: "Línea de crédito flexible", desc: "Acceda a crédito corporativo ajustado a su volumen de compra." },
  { icon: Package, title: "Catálogo de +10,000 piezas", desc: "Amplio stock para todas las marcas y modelos del mercado peruano." },
  { icon: Clock, title: "Entrega en 24-48 horas", desc: "Logística propia en Lima y envíos a provincias garantizados." },
  { icon: Headphones, title: "Asesoría técnica especializada", desc: "Soporte de expertos para identificar la pieza correcta." },
  { icon: FileText, title: "Facturación electrónica", desc: "Documentos tributarios electrónicos emitidos de forma inmediata." },
  { icon: Shield, title: "Garantía en todos los productos", desc: "Respaldo y reposición garantizada en caso de defecto de fábrica." },
  { icon: BarChart3, title: "Portal empresarial privado", desc: "Acceso a su dashboard con pedidos, facturas y línea de crédito." },
  { icon: Truck, title: "Cobertura nacional", desc: "Distribución a todo el Perú a través de nuestra red logística." },
];

export function Beneficios() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="beneficios" ref={ref} className="py-14 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-10"
        >
          <span className="text-red-400 font-semibold text-sm tracking-wider uppercase">
            Por qué elegirnos
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-white mt-3">
            Beneficios exclusivos para{" "}
            <span className="text-red-400">socios B2B</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {beneficios.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.07 }}
              className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:-translate-y-1"
            >
              <div className="bg-blue-900/50 rounded-xl p-3 w-fit mb-4">
                <b.icon className="h-6 w-6 text-blue-300" />
              </div>
              <h3 className="text-white font-bold mb-2">{b.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
