"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ChevronRight } from "lucide-react";

const categorias = [
  { nombre: "Frenos", icon: "🛞", color: "from-red-600 to-red-800", desc: "Discos · Pastillas · Bombines" },
  { nombre: "Filtros", icon: "🔧", color: "from-amber-500 to-amber-700", desc: "Aceite · Aire · Combustible" },
  { nombre: "Suspensión", icon: "⚙️", color: "from-blue-600 to-blue-800", desc: "Amortiguadores · Resortes" },
  { nombre: "Motor", icon: "🔩", color: "from-slate-600 to-slate-800", desc: "Pistones · Juntas · Válvulas" },
  { nombre: "Transmisión", icon: "⚡", color: "from-purple-600 to-purple-800", desc: "Embrague · Caja · Diferencial" },
  { nombre: "Eléctrico", icon: "🔌", color: "from-yellow-500 to-yellow-700", desc: "Alternadores · Baterías · Sensores" },
  { nombre: "Correas", icon: "🔗", color: "from-green-600 to-green-800", desc: "Distribución · Accesorios" },
  { nombre: "Dirección", icon: "🎯", color: "from-cyan-600 to-cyan-800", desc: "Cremallera · Bombas · Rótulas" },
  { nombre: "Refrigeración", icon: "💧", color: "from-teal-600 to-teal-800", desc: "Radiadores · Termostatos" },
  { nombre: "Carrocería", icon: "🚘", color: "from-orange-600 to-orange-800", desc: "Espejos · Lunas · Faros" },
];

export function CatalogoDestacado() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="catalogo" ref={ref} className="py-14 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-10"
        >
          <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">
            Catálogo de repuestos
          </span>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mt-2">
            Busque por <span className="text-blue-900">categoría</span>
          </h2>
          <p className="text-slate-500 mt-2 max-w-lg mx-auto text-sm">
            Repuestos originales y alternativos para todas las marcas. Precios preferenciales para empresas afiliadas.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categorias.map((cat, i) => (
            <motion.div
              key={cat.nombre}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.07 }}
              className="group cursor-pointer"
              onClick={() => document.getElementById("afiliacion")?.scrollIntoView({ behavior: "smooth" })}
            >
              <div className="flex flex-col items-center text-center">
                {/* Circle */}
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                  <span className="text-4xl">{cat.icon}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{cat.nombre}</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-tight">{cat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center mt-10"
        >
          <div className="inline-flex items-center gap-3 bg-blue-900 text-white px-6 py-3 rounded-xl text-sm font-semibold">
            <span>Catálogo completo disponible para socios afiliados</span>
            <a href="#afiliacion" className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors">
              Solicitar acceso <ChevronRight className="h-3 w-3" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
