import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

export const runtime = "nodejs";

// Extrae la "key" del archivo desde la URL de UploadThing para poder borrarlo.
function fileKey(url: string): string | null {
  const m = url.match(/\/f\/([^/?#]+)/);
  return m ? m[1] : null;
}

// Adjunta (o actualiza) la Orden de Compra del cliente en un pedido.
// El archivo ya fue subido a UploadThing; aquí solo guardamos el enlace.
const schema = z.object({
  ocUrl: z.string().url().max(2000).nullable().optional(),
  ocNumero: z.string().max(100).nullable().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.ocUrl !== undefined) data.ocUrl = parsed.data.ocUrl;
  if (parsed.data.ocNumero !== undefined) data.ocNumero = parsed.data.ocNumero;

  // Si se reemplaza o se quita el archivo, borramos el anterior de la nube
  // para que no queden archivos duplicados huérfanos.
  let anterior: string | null = null;
  if (parsed.data.ocUrl !== undefined) {
    const actual = await prisma.pedido.findUnique({ where: { id }, select: { ocUrl: true } });
    if (actual?.ocUrl && actual.ocUrl !== parsed.data.ocUrl) anterior = actual.ocUrl;
  }

  const pedido = await prisma.pedido.update({
    where: { id },
    data,
    select: { id: true, ocUrl: true, ocNumero: true },
  });

  if (anterior) {
    const key = fileKey(anterior);
    if (key) {
      try { await new UTApi().deleteFiles(key); }
      catch (e) { console.error("[oc] no se pudo borrar el archivo anterior:", e); }
    }
  }

  return NextResponse.json({ ok: true, pedido });
}
