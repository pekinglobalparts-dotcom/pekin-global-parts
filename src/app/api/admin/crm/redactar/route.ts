import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAcciones, getFicha360 } from "@/lib/crm";
import { z } from "zod";

export const runtime = "nodejs";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const schema = z.object({ clave: z.string().min(1) });

// Redacta con IA (Groq) un mensaje de WhatsApp personalizado para una acción
// del CRM, usando el contexto real del cliente. Devuelve solo el texto.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const acciones = await getAcciones();
  const acc = acciones.find(a => a.clave === parsed.data.clave);
  if (!acc) return NextResponse.json({ error: "La acción ya no está disponible." }, { status: 409 });

  const apiKey = process.env.GROQ_API_KEY;
  // Sin IA configurada: devolvemos el mensaje base para no bloquear.
  if (!apiKey) return NextResponse.json({ mensaje: acc.mensajeWhatsApp, ia: false });

  // Contexto real del cliente para que el mensaje suene a medida.
  const ficha = await getFicha360(acc.cliente.id);
  const topComprados = ficha?.topComprados.slice(0, 3).map(p => p.nombre).join(", ") || "";
  const ultima = ficha?.cliente.ultimaCompra ? new Date(ficha.cliente.ultimaCompra).toLocaleDateString("es-PE") : "sin registro";

  const system = `Eres un asesor de ventas de "Pekín Global Parts" (Pekín S&A), importadora B2B de autopartes en Perú. Escribes mensajes de WhatsApp para clientes empresa (talleres, concesionarias, aseguradoras). Tono cálido, cercano y profesional en español peruano. Reglas:
- 2 a 4 frases, directo y natural, sin sonar a robot ni a plantilla.
- NO des precios exactos (eso lo cierra el asesor).
- Un emoji como máximo, opcional.
- Termina invitando a responder o a pedir la cotización.
- Devuelve SOLO el texto del mensaje, sin comillas ni encabezados.`;

  const userPrompt = `Tipo de acción: ${acc.tipo}
Objetivo: ${acc.titulo}
Contexto: ${acc.detalle}
Cliente: ${acc.cliente.nombre}
Lo que más compra: ${topComprados || "sin datos"}
Última compra: ${ultima}
${acc.montoPotencial ? `Monto potencial estimado: S/ ${acc.montoPotencial}` : ""}
Mensaje base (mejóralo y personalízalo): ${acc.mensajeWhatsApp}`;

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "system", content: system }, { role: "user", content: userPrompt }],
        temperature: 0.8,
        max_tokens: 220,
      }),
    });
    if (!res.ok) {
      console.error("[crm/redactar] groq", res.status, await res.text());
      return NextResponse.json({ mensaje: acc.mensajeWhatsApp, ia: false });
    }
    const data = await res.json();
    const mensaje = data?.choices?.[0]?.message?.content?.trim() || acc.mensajeWhatsApp;
    return NextResponse.json({ mensaje, ia: true });
  } catch (e) {
    console.error("[crm/redactar] fetch", e);
    return NextResponse.json({ mensaje: acc.mensajeWhatsApp, ia: false });
  }
}
