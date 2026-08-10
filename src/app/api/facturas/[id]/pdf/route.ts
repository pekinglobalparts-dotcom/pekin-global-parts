import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const factura = await prisma.factura.findUnique({ where: { id } });

  if (!factura?.pdfUrl) {
    return NextResponse.json({ error: "PDF no disponible" }, { status: 404 });
  }

  // Only admin or the owner socio can download
  if (session.user.role !== "admin" && session.user.id !== factura.socioId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Facturas nuevas: el PDF vive en la nube (UploadThing) → redirigimos al enlace.
  if (/^https?:\/\//.test(factura.pdfUrl)) {
    return NextResponse.redirect(factura.pdfUrl);
  }

  // Facturas antiguas: el PDF quedó guardado en la base como data URL base64.
  if (!factura.pdfUrl.startsWith("data:")) {
    return NextResponse.json({ error: "PDF no disponible" }, { status: 404 });
  }

  const base64 = factura.pdfUrl.replace("data:application/pdf;base64,", "");
  const buffer = Buffer.from(base64, "base64");
  const nombre = (factura as unknown as { numeroReal?: string }).numeroReal || factura.numero;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="factura-${nombre}.pdf"`,
    },
  });
}
