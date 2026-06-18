import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== (process.env.IMPORT_SECRET || "pekin-import-2026")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.$executeRawUnsafe(`
    ALTER TABLE solicitudes
      ADD COLUMN IF NOT EXISTS "tokenDocumentos" TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS "documentosAt" TIMESTAMP(3)
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS documentos_credito (
      id TEXT PRIMARY KEY,
      "solicitudId" TEXT NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
      tipo TEXT NOT NULL,
      nombre TEXT NOT NULL,
      url TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )
  `);

  return NextResponse.json({ ok: true, msg: "Tabla documentos_credito y columnas creadas correctamente" });
}
