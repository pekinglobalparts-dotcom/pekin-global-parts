"use client";

import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";

export function Contacto() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51953096242";

  return (
    <section id="contacto" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">
            Contacto
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mt-3">
            Estamos para <span className="text-blue-900">ayudarle</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            {[
              { icon: MapPin, title: "Dirección", lines: ["Jr. Cerro Azul 2147, El Agustino, Lima"] },
              { icon: Phone, title: "Teléfono / WhatsApp", lines: ["+51 953 096 242"] },
              { icon: Mail, title: "Correo", lines: ["pekinglobalparts@gmail.com"] },
              { icon: Clock, title: "Horario de atención", lines: ["Lunes a Viernes: 8:00 am - 6:00 pm", "Sábado: 9:00 am - 1:00 pm"] },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="bg-blue-50 rounded-xl p-3 h-fit">
                  <item.icon className="h-5 w-5 text-blue-900" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                  {item.lines.map((line) => (
                    <p key={line} className="text-slate-500 text-sm">{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-3xl p-10 text-center">
            <MessageCircle className="h-16 w-16 text-green-400 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-white mb-3">
              Escríbenos por WhatsApp
            </h3>
            <p className="text-slate-400 mb-8">
              Atención rápida y personalizada. Nuestro equipo le responderá en minutos.
            </p>
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hola, me gustaría obtener información sobre sus productos y servicios.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              <MessageCircle className="h-6 w-6" />
              Iniciar conversación
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
