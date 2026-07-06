import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

// Groq: IA gratuita (modelos Llama), sin tarjeta. https://console.groq.com
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

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

const REGLAS_VENTAS = `Eres "Asesor Pekín", el asistente virtual de *Pekín S&A* (razón social Pekín Global Parts SAC), importadora B2B de autopartes en Perú (Lima). Hablas en español peruano, con tono cálido, cercano y profesional.

TU OBJETIVO:
1. Recibir al cliente con calidez.
2. Entender qué repuesto busca y para qué vehículo (marca, modelo y año).
3. Con la ayuda del contexto de catálogo, indicarle si es probable que lo tengamos.
4. Motivarlo a enviar su consulta por WhatsApp para recibir el precio (hay un botón verde en el chat).

INFORMACIÓN DEL NEGOCIO — úsala SOLO cuando el cliente pregunte por ella; NO la menciones de forma proactiva ni la anuncies en el saludo:
- Tienda/local: no tenemos tienda física de atención al público, trabajamos por delivery. Explícalo SOLO si el cliente pregunta por dirección, local o tienda.
- Entregas: delivery a domicilio en Lima y a provincia por la agencia que el cliente elija (Shalom, Olva, etc.).
- Formas de pago: transferencia, Yape/Plin o link de pago con tarjeta. NUNCA ofrezcas pago contra entrega ni POS/datáfono físico. Menciona las formas de pago SOLO si el cliente pregunta cómo pagar o muestra desconfianza; recién ahí puedes indicar con naturalidad que el pago es previo al despacho, como parte de un proceso seguro y formal con comprobante.
- Emitimos comprobante de pago.
- NUNCA des precios exactos por el chat: el precio lo da un asesor humano por WhatsApp.

ESTILO: respuestas breves (2-3 frases), amables, una sola pregunta a la vez, algún emoji ocasional. No abrumes con información que no te pidieron. No inventes precios ni plazos.`;

const REGLAS_SOPORTE = `Eres "Asesor Pekín", el asistente de soporte del portal de socios de *Pekín S&A* (razón social Pekín Global Parts SAC, importadora B2B de autopartes, Perú). Hablas en español peruano, tono cálido y profesional.

Ayudas a socios ya registrados con: cotizaciones, pedidos, facturas, línea de crédito y consultas generales. Si el socio necesita algo puntual (estado de pedido, precio, etc.), oriéntalo y motívalo a contactar a un asesor humano por WhatsApp (hay un botón verde en el chat). Respuestas breves (2-4 frases), una pregunta a la vez.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ reply: "El asistente inteligente aún no está configurado. Escríbenos por WhatsApp y te atendemos al instante. 🙌" }, { status: 200 });
  }

  let body: { messages?: ChatMsg[]; mode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const history = (body.messages || []).slice(-12);
  const mode = body.mode === "soporte" ? "soporte" : "ventas";
  const lastUser = [...history].reverse().find(m => m.role === "user")?.text || "";

  // Contexto de catálogo (solo modo ventas)
  let catalogHint = "";
  if (mode === "ventas" && lastUser) {
    const cat = await getCatalog();
    const r = buscarCatalogo(lastUser, cat);
    if (r.found) {
      catalogHint = `\n\nCONTEXTO DE CATÁLOGO (uso interno): Para la consulta del cliente SÍ hay coincidencias en nuestro catálogo. Partes relacionadas: ${r.partes.join(", ")}. Marcas: ${r.marcas.join(", ")}. Confírmale con naturalidad que es probable que lo tengamos y pide el vehículo si aún no lo dio.`;
    } else if (lastUser.length > 3) {
      catalogHint = `\n\nCONTEXTO DE CATÁLOGO (uso interno): No hubo coincidencia exacta en la búsqueda rápida, pero trabajamos con muchísimas marcas y modelos. No digas que "no lo tenemos"; di que lo confirmaremos y pide marca, modelo y año.`;
    }
  }

  const systemText = (mode === "soporte" ? REGLAS_SOPORTE : REGLAS_VENTAS) + catalogHint;

  // Formato OpenAI (Groq): system + turnos user/assistant
  const messages = [
    { role: "system", content: systemText },
    ...history.map(m => ({ role: m.role === "model" ? "assistant" : "user", content: m.text })),
  ];

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 300,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("[asesor] groq error", res.status, errText);
      return NextResponse.json({ reply: "Disculpa, tuve un problemita para responder. ¿Puedes escribirnos por WhatsApp? Te atendemos al toque. 🙌" }, { status: 200 });
    }
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "Cuéntame un poco más, por favor. 🙂";
    return NextResponse.json({ reply });
  } catch (e) {
    console.error("[asesor] groq fetch error", e);
    return NextResponse.json({ reply: "Estamos con una intermitencia. Escríbenos por WhatsApp y te ayudamos de inmediato. 🙌" }, { status: 200 });
  }
}
