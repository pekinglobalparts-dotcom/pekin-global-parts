import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const facturaId = formData.get("facturaId") as string | null;
  const numeroReal = formData.get("numeroReal") as string | null;

  if (!file || !facturaId) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  // Save file to public/facturas/
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const dir = join(process.cwd(), "public", "facturas");
  await mkdir(dir, { recursive: true });
  const filename = `factura-${facturaId}-${Date.now()}.pdf`;
  await writeFile(join(dir, filename), buffer);
  const pdfUrl = `/facturas/${filename}`;

  const data: Record<string, unknown> = { pdfUrl };
  if (numeroReal) data.numeroReal = numeroReal;

  const factura = await prisma.factura.update({ where: { id: facturaId }, data });
  return NextResponse.json({ factura, pdfUrl });
}
