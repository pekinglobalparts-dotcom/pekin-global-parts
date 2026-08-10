import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

  const pedido = await prisma.pedido.update({
    where: { id },
    data,
    select: { id: true, ocUrl: true, ocNumero: true },
  });

  return NextResponse.json({ ok: true, pedido });
}
