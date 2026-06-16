import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { status, pdfUrl, numeroReal } = body;

  const data: Record<string, unknown> = {};
  if (status) data.status = status;
  if (pdfUrl !== undefined) data.pdfUrl = pdfUrl;
  if (numeroReal !== undefined) data.numeroReal = numeroReal;

  const factura = await prisma.factura.update({ where: { id }, data });
  return NextResponse.json({ factura });
}
