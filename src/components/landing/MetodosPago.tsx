"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Building2, CreditCard, MessageCircle } from "lucide-react";

const metodos = [
  {
    icon: Building2,
    title: "Transferencia bancaria",
    content: (
      <div className="space-y-2 text-sm text-slate-600">
        <div className="inline-flex items-center gap-1.5 bg-blue-600 text-white font-black text-sm px-3 py-1.5 rounded-lg mb-2 w-fit">
          <span>BCP</span>
          <span className="text-blue-200 font-normal text-xs">Banco de Crédito</span>
        </div>
        <p><span className="font-semibold text-slate-800">Cuenta Soles:</span> 1916917997055</p>
        <p><span className="font-semibold text-slate-800">CCI:</span> 00219100691799705558</p>
        <p><span className="font-semibold text-slate-800">A nombre de:</span> Pekin Global Parts SAC</p>
      </div>
    ),
  },
  {
    icon: CreditCard,
    title: "Pago con tarjeta",
    content: (
      <div className="space-y-3 text-sm text-slate-600">
        <p>Aceptamos todas las tarjetas de débito y crédito.</p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {[
            { name: "VISA", bg: "bg-blue-700", text: "text-white", style: "font-black italic text-lg tracking-tight" },
            { name: "MC", bg: "bg-white border border-slate-200", text: "text-slate-800", style: "font-black text-sm" },
            { name: "AMEX", bg: "bg-blue-500", text: "text-white", style: "font-bold text-xs tracking-wider" },
            { name: "DINERS", bg: "bg-slate-700", text: "text-white", style: "font-bold text-xs tracking-wider" },
          ].map(b => (
            <span key={b.name} className={`${b.bg} ${b.text} ${b.style} px-3 py-1.5 rounded-lg`}>{b.name}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: MessageCircle,
    title: "Pago por WhatsApp",
    content: (
      <div className="space-y-3 text-sm text-slate-600">
        <p>Solicita tu link de pago seguro directo por WhatsApp. Rápido y sin complicaciones.</p>
        <a
          href="https://wa.me/51953096242"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Solicitar link de pago
        </a>
      </div>
    ),
  },
];

export function MetodosPago() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="metodos-pago" ref={ref} className="py-14 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">
            Facilidades para su empresa
          </span>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mt-2">
            Métodos de pago
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {metodos.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12 }}
              className="bg-white rounded-2xl border border-slate-200 p-7 hover:border-blue-200 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-blue-900/10 rounded-xl flex items-center justify-center mb-5">
                <m.icon className="h-6 w-6 text-blue-900" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-3">{m.title}</h3>
              {m.content}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
