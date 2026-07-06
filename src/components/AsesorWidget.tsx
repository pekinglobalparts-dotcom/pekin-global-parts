"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { X, Send, Mic, Headset, RefreshCw, Volume2, VolumeX } from "lucide-react";

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51953096242";

type Msg = { role: "user" | "model"; text: string };

const SALUDO_VENTAS =
  "¡Hola! 👋 Bienvenido a *Pekín S&A* — *tu aliado en movimiento*. 🚗\n\nSomos importadores directos de autopartes. Cuéntame, ¿qué repuesto estás buscando y para qué vehículo? 🔧";

const SALUDO_SOPORTE =
  "¡Hola! 👋 Soy el asistente de *Pekín S&A* — *tu aliado en movimiento*. ¿En qué puedo ayudarte hoy? Puedo apoyarte con cotizaciones, pedidos, facturas o tu línea de crédito. 🙌";

export function AsesorWidget() {
  const pathname = usePathname() || "";
  const isAdmin = pathname.startsWith("/admin");
  const isSocio = pathname.startsWith("/socio");
  const mode: "ventas" | "soporte" = isSocio ? "soporte" : "ventas";
  const saludo = mode === "soporte" ? SALUDO_SOPORTE : SALUDO_VENTAS;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [greeted, setGreeted] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  const speak = useCallback((text: string) => {
    if (!voiceOn || typeof window === "undefined" || !window.speechSynthesis) return;
    const clean = text.replace(/[*_🔧👋💪📦🚚✅🎉•]/g, "");
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "es-PE"; u.rate = 1.05;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }, [voiceOn]);

  const pushBot = useCallback((text: string) => {
    setMessages(prev => [...prev, { role: "model", text }]);
    speak(text);
  }, [speak]);

  // El saludo se muestra recién tras el primer mensaje del cliente (no antes).

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const enviarAsesor = async (history: Msg[]) => {
    setLoading(true);
    try {
      const res = await fetch("/api/asesor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, mode }),
      });
      const data = await res.json();
      pushBot(data.reply || "¿Me repites, por favor? 🙂");
    } catch {
      pushBot("Estamos con una intermitencia. Escríbenos por WhatsApp y te ayudamos de inmediato. 🙌");
    } finally {
      setLoading(false);
    }
  };

  const GREETING_RE = /^(hola|holi|ola|buenas|buenos dias|buenos días|buenas tardes|buenas noches|hi|hey|hello|que tal|qué tal|saludos|buen dia|buen día)\b/i;

  const handleSend = () => {
    const val = input.trim();
    if (!val || loading) return;
    const nuevo: Msg = { role: "user", text: val };
    const history = [...messages, nuevo];
    setMessages(history);
    setInput("");

    // Primer mensaje del cliente → mostramos nuestro saludo de marca (fijo)
    if (!greeted) {
      setGreeted(true);
      setTimeout(() => pushBot(saludo), 300);
      // Si el primer mensaje NO fue solo un saludo, además lo respondemos con IA
      if (!GREETING_RE.test(val)) {
        setTimeout(() => enviarAsesor(history), 900);
      }
      return;
    }
    enviarAsesor(history);
  };

  const resetChat = () => {
    setMessages([]);
    setGreeted(false);
    setInput("");
  };

  const toggleListen = () => {
    if (typeof window === "undefined") return;
    const w = window as unknown as { webkitSpeechRecognition?: new () => Record<string, unknown>; SpeechRecognition?: new () => Record<string, unknown> };
    const SR = w.webkitSpeechRecognition || w.SpeechRecognition;
    if (!SR) { alert("Tu navegador no soporta dictado por voz. Puedes escribir tu mensaje."); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const rec = new SR() as Record<string, unknown> & { start: () => void; stop: () => void };
    rec.lang = "es-PE"; rec.interimResults = false; rec.maxAlternatives = 1;
    rec.onresult = (e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => {
      setInput(e.results[0][0].transcript); setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start(); setListening(true);
  };

  // Mensaje para WhatsApp: resumen de la conversación del cliente
  const buildWa = () => {
    const userMsgs = messages.filter(m => m.role === "user").map(m => m.text);
    const cuerpo = userMsgs.length
      ? `Mi consulta:\n${userMsgs.map(t => `• ${t}`).join("\n")}`
      : "Quiero hacer una consulta sobre un repuesto.";
    const rol = mode === "soporte" ? "Soy socio y necesito apoyo." : "Consulta desde la web.";
    return `Hola, ${rol}\n\n${cuerpo}\n\nQuedo atento. ¡Gracias!`;
  };
  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(buildWa())}`;
  const yaConverso = messages.filter(m => m.role === "user").length > 0;

  if (isAdmin) return null;

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-6 right-5 z-40 flex items-center gap-2 bg-[#0f1f3d] hover:bg-[#16294f] text-white pl-4 pr-5 py-3 rounded-full shadow-2xl transition-all hover:-translate-y-0.5"
          aria-label="Abrir asesor">
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

      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[92vw] max-w-[380px] h-[70vh] max-h-[560px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
          <div className="bg-[#0f1f3d] px-4 py-3 flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#e8121a] shrink-0">
              <Headset className="h-5 w-5 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-[#0f1f3d]" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-sm leading-tight">Asesor Pekín</p>
              <p className="text-green-300 text-[11px]">● En línea · listo para ayudarte</p>
            </div>
            <button onClick={() => setVoiceOn(v => !v)} title={voiceOn ? "Silenciar voz" : "Activar voz"} className="text-white/70 hover:text-white p-1.5">
              {voiceOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button onClick={resetChat} title="Reiniciar" className="text-white/70 hover:text-white p-1.5"><RefreshCw className="h-4 w-4" /></button>
            <button onClick={() => setOpen(false)} title="Cerrar" className="text-white/70 hover:text-white p-1.5"><X className="h-4 w-4" /></button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 text-slate-400">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0f1f3d] mb-3">
                  <Headset className="h-7 w-7 text-white" />
                </span>
                <p className="text-sm font-bold text-slate-600">¡Hola! 👋 Escríbeme para empezar</p>
                <p className="text-xs mt-1">Cuéntame qué repuesto buscas y te ayudo al instante.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-line leading-relaxed ${
                  m.role === "user" ? "bg-[#e8121a] text-white rounded-br-md" : "bg-white text-slate-700 border border-slate-200 rounded-bl-md"
                }`}>{m.text}</div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-400 border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 text-sm">
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}

            {yaConverso && !loading && (
              <div className="pt-1">
                <a href={waHref} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">
                  <Send className="h-4 w-4" /> Enviar mi consulta por WhatsApp
                </a>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-100 bg-white">
            <div className="flex items-end gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Escribe tu mensaje..."
                className="flex-1 border border-slate-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1f3d]" />
              <button onClick={toggleListen} title="Hablar"
                className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-colors ${listening ? "bg-red-100 text-red-600 animate-pulse" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                <Mic className="h-4 w-4" />
              </button>
              <button onClick={handleSend} disabled={!input.trim() || loading}
                className="shrink-0 h-10 w-10 rounded-full bg-[#0f1f3d] hover:bg-[#16294f] disabled:opacity-40 text-white flex items-center justify-center transition-colors">
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-1.5">
              {listening ? "🎤 Escuchando... habla ahora" : "Escribe o toca el micrófono 🎤 para hablar"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
