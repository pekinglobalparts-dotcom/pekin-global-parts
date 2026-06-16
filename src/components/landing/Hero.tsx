"use client";

import { motion } from "framer-motion";
import { ChevronRight, Shield, Truck, Award, Zap } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0a1628]">

      {/* Background: dark gradient + subtle grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f1f3d] to-[#1a0a0a]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Glow effects */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-red-700/15 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"
        />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-16">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-white/8 backdrop-blur border border-white/15 rounded-full px-5 py-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shrink-0" />
            <span className="text-sm text-white/70 font-medium">Plataforma B2B exclusiva · Solo empresas</span>
          </div>
        </motion.div>

        {/* Main headline — centered */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-none tracking-tight"
          >
            TU ALIADO{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
              EN MOVIMIENTO
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-lg text-slate-400 leading-relaxed mt-6 max-w-2xl mx-auto"
          >
            Importadores especializados de autopartes para flotas empresariales,
            concesionarias y talleres. Precios preferenciales con línea de crédito.
          </motion.p>
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap gap-4 justify-center mb-16"
        >
          <a href="#afiliacion">
            <button className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl text-base transition-all hover:scale-105 shadow-lg shadow-red-900/30">
              Solicitar acceso B2B <ChevronRight className="h-5 w-5" />
            </button>
          </a>
          <a href="#catalogo">
            <button className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white hover:bg-white/5 font-semibold px-8 py-4 rounded-xl text-base transition-all">
              Ver catálogo
            </button>
          </a>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-8"
        >
          {[
            { icon: Shield, text: "Garantía certificada" },
            { icon: Truck, text: "Entrega a nivel nacional" },
            { icon: Award, text: "Calidad premium" },
            { icon: Zap, text: "Crédito flexible" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-slate-400 text-sm">
              <div className="w-7 h-7 bg-white/8 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="h-3.5 w-3.5 text-red-400" />
              </div>
              {text}
            </div>
          ))}
        </motion.div>

        {/* Divider strip */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-16 border-t border-white/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Marcas que distribuimos</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {["Toyota", "Nissan", "Hyundai", "Kia", "Chery", "JAC", "Changan", "Ford", "Mitsubishi"].map(b => (
              <span key={b} className="bg-white/5 border border-white/10 text-slate-400 text-xs font-semibold px-3 py-1.5 rounded-lg">
                {b}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none"
      >
        <span className="text-xs text-slate-600">Desplázate</span>
        <div className="w-px h-6 bg-gradient-to-b from-slate-600 to-transparent" />
      </motion.div>
    </section>
  );
}
