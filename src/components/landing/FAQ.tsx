"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const faqs = [
  {
    q: "¿Solo atendemos a empresas?",
    a: "Sí. Somos una plataforma B2B exclusiva. Solo atendemos a empresas con RUC activo.",
  },
  {
    q: "¿Cuánto demora la evaluación?",
    a: "Entre 2 y 5 días hábiles. Le notificamos por correo el resultado.",
  },
  {
    q: "¿Cómo funciona la línea de crédito?",
    a: "Asignamos una línea inicial según el perfil de su empresa, que crece con su historial.",
  },
  {
    q: "¿Tienen cobertura fuera de Lima?",
    a: "Sí. Enviamos a todo el Perú. Los tiempos varían según la zona geográfica.",
  },
  {
    q: "¿Qué marcas cubren?",
    a: "Toyota, Nissan, Hyundai, Kia, Mitsubishi, Ford, Chevrolet, VW y más.",
  },
  {
    q: "¿Puedo consultar precios antes de afiliarme?",
    a: "Sí, puede consultar precios referenciales por WhatsApp antes de crear su cuenta.",
  },
];

export function FAQ() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="faq" ref={ref} className="py-16 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">
            FAQ
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-2">
            Preguntas frecuentes
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-xl border border-slate-200 p-5"
            >
              <h3 className="font-semibold text-slate-900 text-sm mb-1.5 flex items-start gap-2">
                <span className="text-red-600 shrink-0 mt-0.5">Q.</span>
                {faq.q}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed pl-5">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
