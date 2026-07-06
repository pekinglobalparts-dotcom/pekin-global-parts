"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Mic, Headset, RefreshCw, Volume2, VolumeX } from "lucide-react";

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51953096242";

type Msg = { from: "bot" | "user"; text: string };
type Phase = "intro" | "asking" | "done" | "declined";

const INTRO = "¡Hola! 👋 Soy el asistente de *Pekín Global Parts*.\n\nAntes de empezar, así trabajamos:\n\n• Somos *importadores directos* de autopartes.\n• *No contamos con tienda física.*\n• Trabajamos con *entrega a domicilio* (pago contra entrega en Lima o pago previo).\n• Para provincia: envío por agencia (previo pago).\n\n¿Estás de acuerdo en continuar con esta modalidad?";

// Preguntas tras aceptar la modalidad
const STEPS: { key: string; pregunta: string; placeholder: string }[] = [
  { key: "repuesto", pregunta: "¡Perfecto! 🔧 ¿Qué repuesto necesitas?", placeholder: "Ej: corona y piñón, pastillas de freno..." },
  { key: "vehiculo", pregunta: "¿Para qué vehículo es? Indícame *marca, modelo y año*.", placeholder: "Ej: Toyota Hilux 2020" },
];

export function AsesorWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [phase, setPhase] = useState<Phase>("intro");
  const [stepIndex, setStepIndex] = useState(0);
  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [voiceOn, setVoiceOn] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  const speak = useCallback((text: string) => {
    if (!voiceOn || typeof window === "undefined" || !window.speechSynthesis) return;
    const clean = text.replace(/[*_🔧👋💪📦🚚✅•]/g, "");
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "es-PE";
    u.rate = 1.05;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }, [voiceOn]);

  const pushBot = useCallback((text: string) => {
    setMessages(prev => [...prev, { from: "bot", text }]);
    speak(text);
  }, [speak]);

  // Al abrir por primera vez, mostrar intro
  useEffect(() => {
    if (open && messages.length === 0) {
      pushBot(INTRO);
    }
  }, [open, messages.length, pushBot]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const buildResumen = (a: Record<string, string>) => {
    return `Hola, quiero cotizar un repuesto (consulta desde la web):\n\n` +
      `🔧 Repuesto: ${a.repuesto || "-"}\n` +
      `🚗 Vehículo: ${a.vehiculo || "-"}\n\n` +
      `Ya conozco la modalidad de entrega a domicilio. Quedo atento a la cotización. ¡Gracias!`;
  };

  // El usuario acepta o rechaza la modalidad
  const responderIntro = (acepta: boolean) => {
    setMessages(prev => [...prev, { from: "user", text: acepta ? "Sí, continúo" : "No, gracias" }]);
    if (acepta) {
      setPhase("asking");
      setStepIndex(0);
      setTimeout(() => pushBot(STEPS[0].pregunta), 400);
    } else {
      setPhase("declined");
      setTimeout(() => pushBot("Entiendo 🙏 Si en algún momento te acomoda la entrega a domicilio, aquí estaremos. También puedes revisar nuestro catálogo cuando gustes. ¡Gracias por tu visita!"), 400);
    }
  };

  const handleSend = () => {
    const val = input.trim();
    if (!val || phase !== "asking") return;
    setMessages(prev => [...prev, { from: "user", text: val }]);
    const currentKey = STEPS[stepIndex].key;
    const newAnswers = { ...answers, [currentKey]: val };
    setAnswers(newAnswers);
    setInput("");

    const next = stepIndex + 1;
    if (next < STEPS.length) {
      setStepIndex(next);
      setTimeout(() => pushBot(STEPS[next].pregunta), 400);
    } else {
      setPhase("done");
      setTimeout(() => {
        pushBot("¡Listo! 📦 Ya tengo tu consulta. Haz clic en el botón verde para enviarla por WhatsApp y te damos el precio de inmediato. 🚚");
      }, 400);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setPhase("intro");
    setStepIndex(0);
    setAnswers({});
    setInput("");
    setTimeout(() => pushBot(INTRO), 200);
  };

  // Reconocimiento de voz (navegador, gratis)
  const toggleListen = () => {
    if (typeof window === "undefined") return;
    const w = window as unknown as { webkitSpeechRecognition?: new () => Record<string, unknown>; SpeechRecognition?: new () => Record<string, unknown> };
    const SR = w.webkitSpeechRecognition || w.SpeechRecognition;
    if (!SR) {
      alert("Tu navegador no soporta dictado por voz. Puedes escribir tu mensaje.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SR() as Record<string, unknown> & { start: () => void; stop: () => void };
    rec.lang = "es-PE";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(buildResumen(answers))}`;

  return (
    <>
      {/* Botón flotante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-5 z-40 flex items-center gap-2 bg-[#0f1f3d] hover:bg-[#16294f] text-white pl-4 pr-5 py-3 rounded-full shadow-2xl transition-all hover:-translate-y-0.5 group"
          aria-label="Abrir asesor"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#e8121a]">
            <Headset className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-[#0f1f3d] animate-pulse" />
          </span>
          <span className="text-left leading-tight">
            <span className="block text-sm font-black">Asesor en línea</span>
            <span className="block text-[10px] text-blue-200">Cotiza en 1 minuto</span>
          </span>
        </button>
      )}

      {/* Panel del chat */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[92vw] max-w-[380px] h-[70vh] max-h-[560px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-[#0f1f3d] px-4 py-3 flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#e8121a] shrink-0">
              <Headset className="h-5 w-5 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-[#0f1f3d]" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-sm leading-tight">Asesor Pekín</p>
              <p className="text-green-300 text-[11px] flex items-center gap-1">● En línea · listo para ayudarte</p>
            </div>
            <button onClick={() => setVoiceOn(v => !v)} title={voiceOn ? "Silenciar voz" : "Activar voz"}
              className="text-white/70 hover:text-white p-1.5">
              {voiceOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button onClick={resetChat} title="Reiniciar" className="text-white/70 hover:text-white p-1.5">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button onClick={() => setOpen(false)} title="Cerrar" className="text-white/70 hover:text-white p-1.5">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Mensajes */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-line leading-relaxed ${
                  m.from === "user"
                    ? "bg-[#e8121a] text-white rounded-br-md"
                    : "bg-white text-slate-700 border border-slate-200 rounded-bl-md"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}

            {/* Botones Sí / No de la intro */}
            {phase === "intro" && (
              <div className="flex gap-2 pt-1">
                <button onClick={() => responderIntro(true)}
                  className="flex-1 bg-[#0f1f3d] hover:bg-[#16294f] text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                  ✅ Sí, continúo
                </button>
                <button onClick={() => responderIntro(false)}
                  className="flex-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  No, gracias
                </button>
              </div>
            )}

            {/* CTA final */}
            {phase === "done" && (
              <div className="flex flex-col gap-2 pt-1">
                <a href={waHref} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                  <Send className="h-4 w-4" /> Enviar mi consulta por WhatsApp
                </a>
                <a href="/catalogo"
                  className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold py-2.5 rounded-xl transition-colors text-sm">
                  Ver catálogo de repuestos
                </a>
              </div>
            )}

            {/* Rechazó: dar opción de catálogo */}
            {phase === "declined" && (
              <div className="flex flex-col gap-2 pt-1">
                <a href="/catalogo"
                  className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold py-2.5 rounded-xl transition-colors text-sm">
                  Ver catálogo de repuestos
                </a>
                <button onClick={resetChat}
                  className="text-xs text-slate-400 hover:text-slate-600 py-1">Volver a empezar</button>
              </div>
            )}
          </div>

          {/* Input (solo mientras hace preguntas) */}
          {phase === "asking" && (
            <div className="p-3 border-t border-slate-100 bg-white">
              <div className="flex items-end gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder={STEPS[stepIndex]?.placeholder || "Escribe tu mensaje..."}
                  className="flex-1 border border-slate-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1f3d]"
                />
                <button onClick={toggleListen} title="Hablar"
                  className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-colors ${listening ? "bg-red-100 text-red-600 animate-pulse" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                  <Mic className="h-4 w-4" />
                </button>
                <button onClick={handleSend} disabled={!input.trim()}
                  className="shrink-0 h-10 w-10 rounded-full bg-[#0f1f3d] hover:bg-[#16294f] disabled:opacity-40 text-white flex items-center justify-center transition-colors">
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-1.5">
                {listening ? "🎤 Escuchando... habla ahora" : "Responde o toca el micrófono 🎤 para hablar"}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
