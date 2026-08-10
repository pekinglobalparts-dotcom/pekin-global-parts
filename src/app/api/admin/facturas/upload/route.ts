import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// El PDF ya se subió a UploadThing (nube). Aquí solo guardamos el enlace,
// no el archivo — así la base de datos se mantiene liviana.
const schema = z.object({
  facturaId: z.string().min(1),
  url: z.string().url().max(2000),
  numeroReal: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

  const { facturaId, url, numeroReal } = parsed.data;

  const data: Record<string, unknown> = { pdfUrl: url };
  if (numeroReal) data.numeroReal = numeroReal;

  const factura = await prisma.factura.update({ where: { id: facturaId }, data });
  return NextResponse.json({ factura: { ...factura, pdfUrl: "[guardado]" }, ok: true });
}
