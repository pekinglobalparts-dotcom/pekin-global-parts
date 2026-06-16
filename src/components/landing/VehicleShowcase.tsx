"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const vehicles = [
  {
    label: "PICKUPS",
    sub: "Hilux · NP300 · Ranger",
    accent: "from-blue-600 to-blue-800",
    border: "border-blue-500/40",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop",
  },
  {
    label: "SUVs",
    sub: "RAV4 · Tucson · Tiggo",
    accent: "from-red-700 to-red-900",
    border: "border-red-500/40",
    img: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80&fit=crop",
  },
  {
    label: "FLOTAS",
    sub: "Changan · BYD · JAC",
    accent: "from-slate-600 to-slate-800",
    border: "border-slate-500/40",
    img: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80&fit=crop",
  },
];

export function VehicleShowcase() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-16 bg-gradient-to-b from-[#0a1628] to-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-10"
        >
          <span className="text-red-400 font-semibold text-xs tracking-[0.3em] uppercase">Vehículos que atendemos</span>
          <h2 className="text-3xl lg:text-4xl font-black text-white mt-2">
            Repuestos para <span className="text-red-400">toda su flota</span>
          </h2>
          <p className="text-slate-400 mt-2 text-sm max-w-lg mx-auto">
            Pickups, SUVs y flotas corporativas — piezas certificadas para mantener cada vehículo en operación.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {vehicles.map((v, i) => (
            <motion.div
              key={v.label}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 }}
              className={`relative rounded-2xl overflow-hidden border ${v.border} group cursor-default h-64`}
            >
              {/* Background photo */}
              <img
                src={v.img}
                alt={v.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${v.accent} opacity-70 group-hover:opacity-60 transition-opacity`} />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="text-xl font-black text-white tracking-widest mb-1">{v.label}</div>
                <div className="text-white/70 text-sm font-medium">{v.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-5 lg:p-6"
        >
          <div className="flex flex-col lg:flex-row items-center gap-5">
            <div className="shrink-0">
              <span className="bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                Marcas chinas — 30%+ del mercado peruano
              </span>
            </div>
            <div className="flex-1">
              <p className="text-slate-300 text-sm leading-relaxed">
                Stock de repuestos para <strong className="text-red-400">Chery, JAC, DFSK, Changan, Great Wall, Haval, BYD y MG</strong> — piezas originales y alternativas con garantía certificada.
              </p>
            </div>
            <div className="shrink-0">
              <a href="#afiliacion" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                Solicitar catálogo
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
