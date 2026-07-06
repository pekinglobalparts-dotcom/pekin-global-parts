import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

// Modelo gratuito de Gemini
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;

type ChatMsg = { role: "user" | "model"; text: string };

// Catálogo en memoria (se lee una vez)
let catalogCache: [string, string, string, string][] | null = null;
async function getCatalog(): Promise<[string, string, string, string][]> {
  if (catalogCache) return catalogCache;
  try {
    const file = path.join(process.cwd(), "public", "catalogo-data.json");
    const raw = await readFile(file, "utf-8");
    catalogCache = JSON.parse(raw).motores || [];
  } catch {
    catalogCache = [];
  }
  return catalogCache!;
}

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function buscarCatalogo(query: string, motores: [string, string, string, string][]) {
  const qWords = normalize(query).split(/\s+/).filter(w => w.length >= 4);
  if (qWords.length === 0) return { found: false, partes: [] as string[], marcas: [] as string[] };
  const matches = motores.filter(([p]) => {
    const np = normalize(p);
    return qWords.some(w => np.includes(w) || w.includes(np));
  });
  const partes = [...new Set(matches.map(m => m[0]))].slice(0, 6);
  const marcas = [...new Set(matches.map(m => m[1]))].slice(0, 8);
  return { found: matches.length > 0, partes, marcas };
}

const REGLAS_VENTAS = `Eres "Asesor Pekín", el asistente virtual de *Pekín Global Parts*, una empresa importadora B2B de autopartes en Perú (Lima). Hablas en español peruano, con tono cálido, cercano y profesional.

REGLAS DEL NEGOCIO (obligatorias, nunca las contradigas):
- Somos importadores directos. NO tenemos tienda física. Trabajamos solo por delivery a domicilio.
- Enviamos a todo Lima y a provincia por la agencia que el cliente elija (Shalom, Olva, etc.).
- El pago es SIEMPRE antes del despacho: transferencia, Yape/Plin o link de pago con tarjeta. NUNCA ofrezcas pago contra entrega ni POS/datáfono físico.
- NO das precios exactos por el chat. El precio lo da un asesor humano por WhatsApp.
- Emitimos comprobante de pago.

TU OBJETIVO:
1. Recibir al cliente con calidez.
2. Entender qué repuesto busca y para qué vehículo (marca, modelo y año).
3. Con la ayuda del contexto de catálogo, indicarle si es probable que lo tengamos.
4. Motivarlo a enviar su consulta por WhatsApp para recibir el precio (hay un botón verde en el chat).

ESTILO: respuestas breves (2-4 frases máximo), amables, una sola pregunta a la vez. Usa algún emoji ocasional. No inventes precios ni plazos exactos.`;

const REGLAS_SOPORTE = `Eres "Asesor Pekín", el asistente de soporte del portal de socios de *Pekín Global Parts* (importadora B2B de autopartes, Perú). Hablas en español peruano, tono cálido y profesional.

Ayudas a socios ya registrados con: cotizaciones, pedidos, facturas, línea de crédito y consultas generales. Si el socio necesita algo puntual (estado de pedido, precio, etc.), oriéntalo y motívalo a contactar a un asesor humano por WhatsApp (hay un botón verde en el chat). Respuestas breves (2-4 frases), una pregunta a la vez.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "no_key", reply: "El asistente inteligente aún no está configurado. Escríbenos por WhatsApp y te atendemos al instante. 🙌" }, { status: 200 });
  }

  let body: { messages?: ChatMsg[]; mode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const messages = (body.messages || []).slice(-12); // últimos 12 turnos
  const mode = body.mode === "soporte" ? "soporte" : "ventas";
  const lastUser = [...messages].reverse().find(m => m.role === "user")?.text || "";

  // Contexto de catálogo (solo modo ventas)
  let catalogHint = "";
  if (mode === "ventas" && lastUser) {
    const cat = await getCatalog();
    const r = buscarCatalogo(lastUser, cat);
    if (r.found) {
      catalogHint = `\n\nCONTEXTO DE CATÁLOGO (uso interno): Para la consulta del cliente SÍ hay coincidencias en nuestro catálogo. Partes relacionadas: ${r.partes.join(", ")}. Marcas disponibles: ${r.marcas.join(", ")}. Confírmale con naturalidad que es probable que lo tengamos y pide el vehículo si aún no lo dio.`;
    } else if (lastUser.length > 3) {
      catalogHint = `\n\nCONTEXTO DE CATÁLOGO (uso interno): No hubo coincidencia exacta en la búsqueda rápida, pero trabajamos con muchísimas marcas y modelos. No digas que "no lo tenemos"; di que lo confirmaremos y pide marca, modelo y año.`;
    }
  }

  const systemText = (mode === "soporte" ? REGLAS_SOPORTE : REGLAS_VENTAS) + catalogHint;

  const contents = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
  // Gemini exige que la conversación empiece con un turno de rol "user".
  // Descartamos cualquier saludo/mensaje inicial del bot al frente.
  while (contents.length && contents[0].role !== "user") contents.shift();
  if (contents.length === 0) {
    return NextResponse.json({ reply: "¡Hola! Cuéntame, ¿qué repuesto buscas y para qué vehículo? 🔧" });
  }

  const payload = {
    system_instruction: { parts: [{ text: systemText }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
  };

  try {
    const res = await fetch(GEMINI_URL(apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("[asesor] gemini error", res.status, errText);
      return NextResponse.json({ reply: "Disculpa, tuve un problemita para responder. ¿Puedes escribirnos por WhatsApp? Te atendemos al toque. 🙌" }, { status: 200 });
    }
    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      || "Cuéntame un poco más, por favor. 🙂";
    return NextResponse.json({ reply });
  } catch (e) {
    console.error("[asesor] fetch error", e);
    return NextResponse.json({ reply: "Estamos con una intermitencia. Escríbenos por WhatsApp y te ayudamos de inmediato. 🙌" }, { status: 200 });
  }
}
