"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ChevronRight, Shield, Truck, Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Empresas socias", display: "Socios afiliados" },
  { label: "Fundación", display: "Desde 2024" },
  { label: "Referencias", display: "+10K referencias" },
  { label: "Satisfacción", display: "Alta satisfacción" },
];

function StatCard({ stat, inView }: { stat: typeof stats[0]; inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
    >
      <div className="text-2xl font-black text-white mb-1">
        {stat.display}
      </div>
      <div className="text-sm text-slate-400">{stat.label}</div>
    </motion.div>
  );
}

export function Hero() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const brands = ["Toyota", "Nissan", "Hyundai", "Kia", "Mitsubishi", "Ford", "Chevrolet", "VW"];
  const categories = ["Frenos", "Suspensión", "Motor", "Transmisión", "Eléctrico", "Carrocería", "Filtros", "Correas"];

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden bg-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-900" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-0 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 mb-8"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-white/80 font-medium">
                Plataforma B2B exclusiva para empresas
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-black text-white leading-none mb-6 tracking-tight"
            >
              TU ALIADO{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
                EN
              </span>{" "}
              MOVIMIENTO
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-400 leading-relaxed mb-10 max-w-lg"
            >
              Importamos las mejores autopartes del mundo para mantener sus flotas
              operativas. Calidad certificada, entrega garantizada, crédito flexible.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <a href="#afiliacion">
                <Button size="xl" variant="secondary">
                  Solicitar acceso B2B <ChevronRight className="h-5 w-5" />
                </Button>
              </a>
              <a href="#catalogo">
                <Button
                  size="xl"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:text-white"
                >
                  Ver catálogo
                </Button>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex items-center gap-6 flex-wrap"
            >
              {[
                { icon: Shield, text: "Garantía certificada" },
                { icon: Truck, text: "Entrega nacional" },
                { icon: Award, text: "Calidad premium" },
                { icon: Zap, text: "Crédito inmediato" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-slate-400 text-sm">
                  <Icon className="h-4 w-4 text-red-400 shrink-0" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-4"
          >
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <StatCard stat={stat} inView={inView} />
                </motion.div>
              ))}
            </div>

            {/* Brands strip */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5"
            >
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-semibold">Marcas disponibles</p>
              <div className="flex flex-wrap gap-2">
                {brands.map(b => (
                  <span key={b} className="bg-white/10 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors">
                    {b}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Categories strip */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.9 }}
              className="bg-gradient-to-r from-red-900/30 to-blue-900/30 border border-white/10 rounded-2xl p-5"
            >
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-semibold">Categorías principales</p>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <span key={c} className="bg-white/5 border border-white/10 text-slate-300 text-xs font-medium px-3 py-1.5 rounded-lg">
                    {c}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
      >
        <span className="text-xs text-slate-500">Descubre más</span>
        <div className="w-px h-8 bg-gradient-to-b from-slate-500 to-transparent" />
      </motion.div>
    </section>
  );
}
