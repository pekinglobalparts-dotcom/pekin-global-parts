import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UTApi } from "uploadthing/server";
import { marcarAguaBuffer, SELLO_VERSION } from "@/lib/watermark-server";

// Re-sella las fotos del catálogo que no tienen la versión actual del sello.
// Solo Super Admin. Procesa por lotes para no exceder el tiempo de ejecución.
export const runtime = "nodejs";
export const maxDuration = 60;

const LOTE = 10;

export async function POST() {
  const session = await auth();
  if (!session || session.user.role !== "admin" || session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pendientes = await prisma.productoVitrina.findMany({
    where: { selloVersion: { lt: SELLO_VERSION }, NOT: { imagenUrl: null } },
    select: { id: true, imagenUrl: true },
    take: LOTE,
  });

  if (pendientes.length === 0) {
    return NextResponse.json({ ok: true, selladas: 0, restantes: 0, mensaje: "No hay fotos pendientes." });
  }

  const utapi = new UTApi();
  let selladas = 0;
  const errores: string[] = [];

  for (const p of pendientes) {
    try {
      const res = await fetch(p.imagenUrl as string);
      if (!res.ok) throw new Error(`descarga ${res.status}`);
      const original = Buffer.from(await res.arrayBuffer());
      const sellada = await marcarAguaBuffer(original);

      const file = new File([new Uint8Array(sellada)], `vitrina-${p.id}-pekin.jpg`, { type: "image/jpeg" });
      const up = await utapi.uploadFiles(file);
      const data = up?.data as { ufsUrl?: string; url?: string } | null;
      const nuevaUrl = data?.ufsUrl ?? data?.url;
      if (!nuevaUrl) throw new Error("subida sin URL");

      await prisma.productoVitrina.update({
        where: { id: p.id },
        data: { imagenUrl: nuevaUrl, fotoSellada: true, selloVersion: SELLO_VERSION },
      });
      selladas++;
    } catch (e) {
      errores.push(`${p.id}: ${(e as Error).message}`);
    }
  }

  const restantes = await prisma.productoVitrina.count({
    where: { selloVersion: { lt: SELLO_VERSION }, NOT: { imagenUrl: null } },
  });

  // Si quedan pendientes pero este lote no selló ninguno, es que todos fallan:
  // evitamos un bucle infinito en el cliente devolviendo los errores.
  return NextResponse.json({ ok: true, selladas, restantes, atascado: selladas === 0 && restantes > 0, errores });
}
