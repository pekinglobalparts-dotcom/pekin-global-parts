import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== (process.env.IMPORT_SECRET || "pekin-import-2026")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await prisma.$executeRawUnsafe(`ALTER TABLE facturas ADD COLUMN IF NOT EXISTS "numeroReal" TEXT`);
  return NextResponse.json({ ok: true, msg: "columna numeroReal agregada" });
}
