"use client";

import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface WhatsAppButtonProps {
  message?: string;
  context?: string;
}

export function WhatsAppButton({ message, context }: WhatsAppButtonProps) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51953096242";
  const [open, setOpen] = useState(false);

  const defaultMsg = message ||
    "Hola, me gustaría obtener información sobre sus autopartes y repuestos.";

  const waUrl = `https://wa.me/${number}?text=${encodeURIComponent(defaultMsg)}`;

  return (
    <>
      {/* Popup card */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 w-72 overflow-hidden"
          >
            <div className="bg-green-500 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-white" />
                <span className="text-white font-bold text-sm">Pekin Global Parts</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4">
              <div className="bg-green-50 rounded-xl px-4 py-3 mb-4 text-sm text-slate-700 leading-relaxed">
                {context || "¡Hola! 👋 ¿En qué podemos ayudarle hoy? Estamos para atenderle."}
              </div>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors w-full"
                onClick={() => setOpen(false)}
              >
                <MessageCircle className="h-4 w-4" />
                Iniciar conversación
              </a>

              <p className="text-center text-xs text-slate-400 mt-2">
                Respuesta inmediata · Lun–Sáb 8am–6pm
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: "spring", damping: 20 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-xl shadow-green-500/40 flex items-center gap-2 group transition-colors"
        style={{ padding: "14px 18px" }}
        aria-label="WhatsApp"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="wa" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-semibold">
                WhatsApp
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
