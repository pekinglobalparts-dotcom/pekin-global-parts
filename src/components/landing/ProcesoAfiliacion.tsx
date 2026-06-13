"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { FileText, Search, CheckCircle, KeyRound, ShoppingCart } from "lucide-react";

const pasos = [
  { icon: FileText, num: "01", title: "Envía tu solicitud", desc: "Completa el formulario con los datos de tu empresa. Es rápido y sencillo." },
  { icon: Search, num: "02", title: "Evaluación", desc: "Nuestro equipo revisa tu solicitud en 2 a 5 días hábiles." },
  { icon: CheckCircle, num: "03", title: "Aprobación", desc: "Recibirás un correo de aprobación con tu línea de crédito asignada." },
  { icon: KeyRound, num: "04", title: "Activación de cuenta", desc: "Accede al portal con tus credenciales y configura tu perfil." },
  { icon: ShoppingCart, num: "05", title: "Empieza a comprar", desc: "Solicita cotizaciones, realiza pedidos y gestiona tus facturas." },
];

export function ProcesoAfiliacion() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-red-400 font-semibold text-sm tracking-wider uppercase">
            Proceso de afiliación
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-white mt-3">
            5 pasos para ser <span className="text-red-400">socio</span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connector line desktop */}
          <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {pasos.map((paso, i) => (
              <motion.div
                key={paso.num}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="text-center relative"
              >
                <div className="relative inline-flex">
                  <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-4 mx-auto">
                    <paso.icon className="h-8 w-8 text-white" />
                  </div>
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-white font-bold mb-2">{paso.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{paso.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
