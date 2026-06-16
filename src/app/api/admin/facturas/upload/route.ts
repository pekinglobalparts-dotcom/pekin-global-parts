import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const facturaId = formData.get("facturaId") as string | null;
  const numeroReal = formData.get("numeroReal") as string | null;

  if (!file || !facturaId) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

  // Convert to base64 data URL — stored directly in DB, no filesystem needed
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const pdfUrl = `data:application/pdf;base64,${base64}`;

  const data: Record<string, unknown> = { pdfUrl };
  if (numeroReal) data.numeroReal = numeroReal;

  const factura = await prisma.factura.update({ where: { id: facturaId }, data });
  // Don't return the base64 blob in the response — just confirm success
  return NextResponse.json({ factura: { ...factura, pdfUrl: "[guardado]" }, ok: true });
}
