"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { X, Send, Mic, Headset, RefreshCw, Volume2, VolumeX } from "lucide-react";

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51953096242";

type Msg = { from: "bot" | "user"; text: string };
type Phase = "part" | "vehicle" | "support" | "done";
type CatalogData = { motores: [string, string, string, string][] };

const GREETING_VENTAS =
  "¡Hola! 👋 Gracias por visitar *Pekín Global Parts*.\n\n" +
  "Somos *importadores directos B2B* de autopartes 🚚:\n" +
  "• Trabajamos por delivery (no tenemos tienda física), así te damos mejor precio.\n" +
  "• Envíos a todo Lima y a provincia por la agencia que elijas.\n" +
  "• Pago fácil y seguro *antes del despacho*: transferencia, Yape/Plin o *link de pago* con tarjeta 💳.\n\n" +
  "Cuéntame, ¿qué repuesto estás buscando? 🔧";

const GREETING_SOPORTE =
  "¡Hola! 👋 Soy el asistente de *Pekín Global Parts*.\n\n" +
  "¿En qué puedo ayudarte hoy? Puedo apoyarte con una *cotización*, un *pedido*, una *factura*, tu *línea de crédito* o cualquier consulta. Cuéntame y te derivo con un asesor. 🙌";

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function buscarEnCatalogo(query: string, motores: CatalogData["motores"]) {
  const qWords = normalize(query).split(/\s+/).filter(w => w.length >= 4);
  if (qWords.length === 0) return { found: false, partes: [] as string[], marcas: [] as string[] };
  const matches = motores.filter(([p]) => {
    const np = normalize(p);
    return qWords.some(w => np.includes(w) || w.includes(np));
  });
  const partes = [...new Set(matches.map(m => m[0]))].slice(0, 4);
  const marcas = [...new Set(matches.map(m => m[1]))].slice(0, 6);
  return { found: matches.length > 0, partes, marcas };
}

export function AsesorWidget() {
  const pathname = usePathname() || "";
  const isAdmin = pathname.startsWith("/admin");
  const isSocio = pathname.startsWith("/socio");
  const mode: "ventas" | "soporte" = isSocio ? "soporte" : "ventas";
  const greeting = mode === "soporte" ? GREETING_SOPORTE : GREETING_VENTAS;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [phase, setPhase] = useState<Phase>(mode === "soporte" ? "support" : "part");
  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState<{ repuesto: string; vehiculo: string; disponible: boolean | null }>({ repuesto: "", vehiculo: "", disponible: null });
  const [supportMsg, setSupportMsg] = useState("");
  const [voiceOn, setVoiceOn] = useState(false);
  const [listening, setListening] = useState(false);
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  // Cargar catálogo al abrir (una sola vez, solo en modo ventas)
  useEffect(() => {
    if (open && mode === "ventas" && !catalog) {
      fetch("/catalogo-data.json").then(r => r.json()).then(setCatalog).catch(() => setCatalog({ motores: [] }));
    }
  }, [open, mode, catalog]);

  const speak = useCallback((text: string) => {
    if (!voiceOn || typeof window === "undefined" || !window.speechSynthesis) return;
    const clean = text.replace(/[*_🔧👋💪📦🚚✅🎉•]/g, "");
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "es-PE"; u.rate = 1.05;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }, [voiceOn]);

  const pushBot = useCallback((text: string) => {
    setMessages(prev => [...prev, { from: "bot", text }]);
    speak(text);
  }, [speak]);

  useEffect(() => {
    if (open && messages.length === 0) pushBot(greeting);
  }, [open, messages.length, pushBot, greeting]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const buildResumen = () => {
    if (mode === "soporte") {
      return `Hola, soy socio de Pekín Global Parts y necesito apoyo:\n\n"${supportMsg}"\n\nQuedo atento. ¡Gracias!`;
    }
    const dispo = answers.disponible === true
      ? "Disponibilidad: preliminarmente SÍ (a confirmar)"
      : "Disponibilidad: a confirmar con asesor";
    return `Hola, consulta desde la web:\n\n` +
      `🔧 Repuesto: ${answers.repuesto || "-"}\n` +
      `🚗 Vehículo: ${answers.vehiculo || "-"}\n` +
      `📋 ${dispo}\n\n` +
      `Entiendo la modalidad: pago antes del despacho y envío a domicilio/agencia. Quedo atento al precio. ¡Gracias!`;
  };

  const handleSend = () => {
    const val = input.trim();
    if (!val || phase === "done") return;
    setMessages(prev => [...prev, { from: "user", text: val }]);
    setInput("");

    if (phase === "support") {
      setSupportMsg(val);
      setPhase("done");
      setTimeout(() => pushBot("¡Entendido! 🙌 Toca el botón verde y te derivo con un asesor por WhatsApp para atenderte al instante."), 450);
      return;
    }

    if (phase === "part") {
      const res = catalog ? buscarEnCatalogo(val, catalog.motores) : { found: false, partes: [], marcas: [] };
      setAnswers(a => ({ ...a, repuesto: val, disponible: res.found }));
      setPhase("vehicle");
      setTimeout(() => {
        if (res.found) {
          const marcasTxt = res.marcas.length ? ` (${res.marcas.slice(0, 4).join(", ")}${res.marcas.length > 4 ? "..." : ""})` : "";
          pushBot(`¡Buenas noticias! ✅ *Sí manejamos ese tipo de repuesto*${marcasTxt}.\n\nPara confirmarte disponibilidad exacta y precio, ¿para qué vehículo es? Indícame *marca, modelo y año*.`);
        } else {
          pushBot(`Puede que lo tengamos aunque no aparezca en mi lista rápida — trabajamos con muchas marcas. 👍\n\n¿Para qué vehículo es? Indícame *marca, modelo y año* y un asesor te confirma disponibilidad y precio.`);
        }
      }, 450);
    } else if (phase === "vehicle") {
      setAnswers(a => ({ ...a, vehiculo: val }));
      setPhase("done");
      setTimeout(() => {
        pushBot(`¡Perfecto! 📦 Ya tengo tu consulta. Haz clic en el botón verde para enviarla por WhatsApp y un asesor te dará el precio de inmediato. 🚚`);
      }, 450);
    }
  };

  const resetChat = () => {
    setMessages([]); setPhase(mode === "soporte" ? "support" : "part"); setInput("");
    setAnswers({ repuesto: "", vehiculo: "", disponible: null });
    setSupportMsg("");
    setTimeout(() => pushBot(greeting), 200);
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

  const placeholder = phase === "support" ? "Escribe tu consulta..."
    : phase === "part" ? "Ej: pastillas de freno, amortiguador..."
    : "Ej: Toyota Hilux 2020";
  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(buildResumen())}`;

  // No mostrar el asesor en el panel admin (uso interno)
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
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-line leading-relaxed ${
                  m.from === "user" ? "bg-[#e8121a] text-white rounded-br-md" : "bg-white text-slate-700 border border-slate-200 rounded-bl-md"
                }`}>{m.text}</div>
              </div>
            ))}

            {phase === "done" && (
              <div className="flex flex-col gap-2 pt-1">
                <a href={waHref} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                  <Send className="h-4 w-4" /> Enviar mi consulta por WhatsApp
                </a>
                <a href="/catalogo" className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold py-2.5 rounded-xl transition-colors text-sm">
                  Ver catálogo de repuestos
                </a>
              </div>
            )}
          </div>

          {phase !== "done" && (
            <div className="p-3 border-t border-slate-100 bg-white">
              <div className="flex items-end gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder={placeholder}
                  className="flex-1 border border-slate-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1f3d]" />
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
