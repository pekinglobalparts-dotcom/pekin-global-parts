import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== (process.env.IMPORT_SECRET || "pekin-import-2026")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Add TipoPago enum and new columns to socios
  await prisma.$executeRawUnsafe(`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TipoPago') THEN
      CREATE TYPE "TipoPago" AS ENUM ('CREDITO', 'CONTADO');
    END IF;
  END $$`);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE socios
      ADD COLUMN IF NOT EXISTS "tipoPago" "TipoPago" NOT NULL DEFAULT 'CREDITO',
      ADD COLUMN IF NOT EXISTS "plazoCredito" INTEGER NOT NULL DEFAULT 30
  `);

  return NextResponse.json({ ok: true, msg: "tipoPago y plazoCredito agregados a socios" });
}
