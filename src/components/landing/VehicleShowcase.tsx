"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function PickupSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 160" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M20 120 L20 95 Q20 80 35 75 L80 70 L100 45 Q108 32 125 30 L220 28 Q240 28 255 40 L290 70 L360 72 Q378 73 385 82 L390 95 L390 120 Z" />
      <path d="M100 70 L105 45 Q112 32 128 30 L215 28 Q232 28 245 38 L278 70 Z" fill="rgba(0,0,0,0.3)" />
      <path d="M110 68 L118 47 Q124 35 138 33 L205 31 L238 33 Q250 36 260 48 L272 68 Z" fill="rgba(255,255,255,0.08)" />
      <circle cx="80" cy="120" r="28" fill="transparent" stroke="currentColor" strokeWidth="3"/>
      <circle cx="80" cy="120" r="18" />
      <circle cx="80" cy="120" r="8" fill="rgba(255,255,255,0.3)" />
      <circle cx="310" cy="120" r="28" fill="transparent" stroke="currentColor" strokeWidth="3"/>
      <circle cx="310" cy="120" r="18" />
      <circle cx="310" cy="120" r="8" fill="rgba(255,255,255,0.3)" />
      <rect x="12" y="95" width="15" height="28" rx="3" />
      <rect x="375" y="95" width="15" height="28" rx="3" />
      <rect x="22" y="88" width="16" height="8" rx="2" fill="rgba(255,220,100,0.6)" />
      <rect x="362" y="88" width="14" height="8" rx="2" fill="rgba(255,80,80,0.5)" />
      <rect x="286" y="70" width="4" height="52" />
      <ellipse cx="200" cy="148" rx="170" ry="6" fill="rgba(0,0,0,0.2)" />
    </svg>
  );
}

function SUVSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 380 150" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M18 115 L18 90 Q18 76 30 72 L65 68 L90 40 Q100 26 120 24 L255 22 Q278 22 292 36 L320 68 L352 70 Q368 72 372 84 L375 100 L375 115 Z" />
      <path d="M90 68 L95 42 Q104 27 122 25 L250 23 Q270 23 282 35 L308 68 Z" fill="rgba(0,0,0,0.25)" />
      <path d="M100 66 L108 44 Q116 30 130 28 L245 26 Q264 27 274 38 L298 66 Z" fill="rgba(255,255,255,0.07)" />
      <circle cx="75" cy="115" r="26" fill="transparent" stroke="currentColor" strokeWidth="3"/>
      <circle cx="75" cy="115" r="17" />
      <circle cx="75" cy="115" r="7" fill="rgba(255,255,255,0.3)" />
      <circle cx="298" cy="115" r="26" fill="transparent" stroke="currentColor" strokeWidth="3"/>
      <circle cx="298" cy="115" r="17" />
      <circle cx="298" cy="115" r="7" fill="rgba(255,255,255,0.3)" />
      <rect x="10" y="90" width="14" height="26" rx="3" />
      <rect x="358" y="90" width="14" height="26" rx="3" />
      <rect x="14" y="84" width="14" height="8" rx="2" fill="rgba(255,220,100,0.6)" />
      <rect x="352" y="84" width="13" height="8" rx="2" fill="rgba(255,80,80,0.5)" />
      <ellipse cx="188" cy="142" rx="160" ry="5" fill="rgba(0,0,0,0.2)" />
    </svg>
  );
}

const vehicles = [
  { component: PickupSilhouette, label: "PICKUPS", sub: "Hilux · NP300 · Ranger", color: "text-blue-400", float: { y: [-8, 0, -8] as number[], duration: 4 } },
  { component: SUVSilhouette, label: "SUVs", sub: "RAV4 · Tucson · Tiggo", color: "text-red-400", float: { y: [0, -10, 0] as number[], duration: 5 } },
  { component: PickupSilhouette, label: "FLOTAS", sub: "Changan · BYD · JAC", color: "text-slate-400", float: { y: [-5, -12, -5] as number[], duration: 3.5 } },
];

export function VehicleShowcase() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-[#0a1628] to-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-red-400 font-semibold text-xs tracking-[0.3em] uppercase">Vehículos que atendemos</span>
          <h2 className="text-3xl lg:text-4xl font-black text-white mt-3">
            Repuestos para <span className="text-red-400">toda su flota</span>
          </h2>
          <p className="text-slate-400 mt-3 text-sm max-w-lg mx-auto">
            Pickups, SUVs, sedanes y camiones — tenemos las piezas para mantener cada vehículo en operación.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {vehicles.map((v, i) => (
            <motion.div
              key={v.label}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 }}
              className="text-center group"
            >
              <div className="relative mb-6">
                <div
                  className="absolute inset-0 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{ background: `radial-gradient(ellipse, ${i === 0 ? '#3b82f6' : i === 1 ? '#ef4444' : '#64748b'} 0%, transparent 70%)` }}
                />
                <motion.div
                  animate={{ y: v.float.y }}
                  transition={{ duration: v.float.duration, repeat: Infinity, ease: "easeInOut" }}
                  className={`relative ${v.color} opacity-80 group-hover:opacity-100 transition-opacity`}
                >
                  <v.component className="w-full h-auto" />
                </motion.div>
              </div>

              <div className="space-y-1">
                <div className={`text-lg font-black tracking-widest ${v.color}`}>{v.label}</div>
                <div className="text-slate-400 text-sm font-medium">{v.sub}</div>
              </div>

              <motion.div
                initial={{ width: 0 }}
                animate={inView ? { width: "40px" } : {}}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                className={`h-0.5 mx-auto mt-4 ${i === 0 ? 'bg-blue-400' : i === 1 ? 'bg-red-400' : 'bg-slate-400'} opacity-60`}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-16 bg-white/5 border border-white/10 rounded-2xl p-6 lg:p-8"
        >
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="shrink-0">
              <span className="bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                Marcas chinas — Mercado en crecimiento
              </span>
            </div>
            <div className="flex-1">
              <p className="text-slate-300 text-sm leading-relaxed">
                Las marcas chinas ya representan el <strong className="text-white">30%+ del mercado automotriz peruano</strong>.
                Tenemos stock de repuestos para <strong className="text-red-400">Chery, JAC, DFSK, Changan, Great Wall, Haval, BYD y MG</strong> —
                piezas originales y alternativas con garantía certificada.
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
