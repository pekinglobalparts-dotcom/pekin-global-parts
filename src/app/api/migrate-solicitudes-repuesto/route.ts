import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== (process.env.IMPORT_SECRET || "pekin-import-2026")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Make productoId optional in pedido_items and add descripcion
  await prisma.$executeRawUnsafe(`
    ALTER TABLE pedido_items
      ALTER COLUMN "productoId" DROP NOT NULL,
      ADD COLUMN IF NOT EXISTS "descripcion" TEXT
  `);

  // Create SolicitudRepuestoStatus enum
  await prisma.$executeRawUnsafe(`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SolicitudRepuestoStatus') THEN
      CREATE TYPE "SolicitudRepuestoStatus" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA');
    END IF;
  END $$`);

  // Create solicitudes_repuesto table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS solicitudes_repuesto (
      id              TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      numero          TEXT UNIQUE NOT NULL,
      "socioId"       TEXT NOT NULL REFERENCES socios(id),
      "marcaVehiculo" TEXT,
      "modeloVehiculo" TEXT,
      "anioVehiculo"  TEXT,
      descripcion     TEXT NOT NULL,
      cantidad        INTEGER NOT NULL DEFAULT 1,
      notas           TEXT,
      status          "SolicitudRepuestoStatus" NOT NULL DEFAULT 'PENDIENTE',
      "pedidoId"      TEXT UNIQUE REFERENCES pedidos(id),
      "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt"     TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  return NextResponse.json({ ok: true, msg: "Migración solicitudes_repuesto completada" });
}
