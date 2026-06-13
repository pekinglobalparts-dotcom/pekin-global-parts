"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "¿Pueden comprar personas naturales?",
    a: "No. Pekin Global Parts es una plataforma exclusivamente B2B. Solo atendemos a empresas legalmente constituidas con RUC activo.",
  },
  {
    q: "¿Cuánto demora la evaluación de mi solicitud?",
    a: "El proceso de evaluación toma entre 2 y 5 días hábiles. Le notificaremos por correo electrónico el resultado.",
  },
  {
    q: "¿Cómo funciona la línea de crédito?",
    a: "Asignamos una línea de crédito inicial según el perfil de su empresa. Esta puede incrementarse según su historial de compras con nosotros.",
  },
  {
    q: "¿Tienen cobertura fuera de Lima?",
    a: "Sí. Realizamos envíos a todo el Perú a través de nuestra red de transportistas. Los tiempos varían según la zona geográfica.",
  },
  {
    q: "¿Qué marcas de vehículos cubren?",
    a: "Contamos con piezas para Toyota, Nissan, Hyundai, Kia, Mitsubishi, Ford, Chevrolet, Volkswagen, entre otras marcas presentes en el mercado peruano.",
  },
  {
    q: "¿Puedo solicitar cotizaciones antes de ser aprobado?",
    a: "Las cotizaciones formales requieren cuenta activa. Sin embargo, puede consultar precios referenciales por WhatsApp.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">
            FAQ
          </span>
          <h2 className="text-4xl font-black text-slate-900 mt-3">
            Preguntas frecuentes
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-6 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold text-slate-900 pr-4">{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 text-slate-400 shrink-0 transition-transform ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-6 text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
